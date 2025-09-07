import { type NextRequest, NextResponse } from "next/server"

// Types
interface GitHubTreeItem {
  path: string
  mode: string
  type: "blob" | "tree"
  sha: string
  size?: number
  url: string
}

interface GitHubTreeResponse {
  sha: string
  url: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

interface OptimizedMarkdownFile {
  name: string
  path: string
  sha: string
  size?: number
  folder: string
  extension: string
  download_url: string
  html_url: string
}

// Constants
const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown", ".mdown", ".mkdn", ".mkd"])
const DEFAULT_BRANCHES = ["main", "master", "develop", "dev"] as const
const MAX_RETRIES = 2
const RETRY_DELAY = 1000
const API_BASE = "https://api.github.com"
const RAW_BASE = "https://raw.githubusercontent.com"

// Configuration
interface Config {
  owner: string
  repo: string
  token: string
  branch: string
  maxSize: number
  includeStats: boolean
  groupByFolder: boolean
}

// Validation utilities
const validateEnvVars = () => {
  const { GITHUB_OWNER: owner, GITHUB_REPO: repo, GITHUB_TOKEN: token } = process.env
  
  if (!owner || !repo || !token) {
    throw new Error("Missing required environment variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN")
  }
  
  return { owner, repo, token }
}

const parseQueryParams = (searchParams: URLSearchParams) => ({
  branch: searchParams.get("branch") || "main",
  maxSize: Math.max(0, parseInt(searchParams.get("max_size") || "0")),
  includeStats: searchParams.get("stats") !== "false",
  groupByFolder: searchParams.get("group") === "true",
})

// HTTP utilities
const createHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "GitHub-MD-Fetcher/2.0",
})

const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  let lastError: Error | null = null
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options)
      
      if (response.ok) return response
      
      // Don't retry on client errors
      if (response.status >= 400 && response.status < 500) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(`GitHub API error (${response.status}): ${error.message}`)
      }
      
      if (i === retries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)))
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown fetch error")
      if (i === retries) throw lastError
    }
  }
  
  throw lastError || new Error("Fetch failed after retries")
}

// GitHub API functions
const findBranch = async (config: Config, branchName: string): Promise<string> => {
  const { owner, repo, token } = config
  const headers = createHeaders(token)
  
  const branchesToTry = branchName !== "main" 
    ? [branchName, ...DEFAULT_BRANCHES.filter(b => b !== branchName)]
    : DEFAULT_BRANCHES

  for (const branch of branchesToTry) {
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/repos/${owner}/${repo}/branches/${branch}`,
        { headers }
      )
      
      const data = await response.json()
      return data.commit.sha
    } catch (error) {
      if (error instanceof Error && !error.message.includes("404")) {
        console.warn(`Error checking branch ${branch}:`, error.message)
      }
      continue
    }
  }
  
  throw new Error(`No accessible branches found. Tried: ${branchesToTry.join(", ")}`)
}

const fetchRepoTree = async (config: Config, commitSha: string): Promise<GitHubTreeResponse> => {
  const { owner, repo, token } = config
  
  const response = await fetchWithRetry(
    `${API_BASE}/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
    { headers: createHeaders(token) }
  )
  
  return response.json()
}

// File processing utilities
const isMarkdownFile = (path: string, maxSize: number, fileSize?: number): boolean => {
  // Quick extension check first
  const ext = path.substring(path.lastIndexOf(".")).toLowerCase()
  if (!MARKDOWN_EXTENSIONS.has(ext)) return false
  
  // Size filter
  return maxSize === 0 || !fileSize || fileSize <= maxSize
}

const processMarkdownFile = (item: GitHubTreeItem, config: Config): OptimizedMarkdownFile => {
  const { owner, repo, branch } = config
  const pathParts = item.path.split("/")
  const name = pathParts[pathParts.length - 1]
  const folder = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "root"
  const extension = name.substring(name.lastIndexOf(".")).toLowerCase()
  
  return {
    name,
    path: item.path,
    sha: item.sha,
    size: item.size,
    folder,
    extension,
    download_url: `${RAW_BASE}/${owner}/${repo}/${branch}/${item.path}`,
    html_url: `https://github.com/${owner}/${repo}/blob/${branch}/${item.path}`,
  }
}

const calculateStats = (files: OptimizedMarkdownFile[], totalItems: number, truncated: boolean) => {
  if (files.length === 0) {
    return {
      totalTreeItems: totalItems,
      markdownCount: 0,
      truncated,
      folders: 0,
      extensions: [],
      totalSize: 0,
      averageSize: 0,
    }
  }
  
  const folderSet = new Set<string>()
  const extensionSet = new Set<string>()
  let totalSize = 0
  
  for (const file of files) {
    folderSet.add(file.folder)
    extensionSet.add(file.extension)
    totalSize += file.size || 0
  }
  
  return {
    totalTreeItems: totalItems,
    markdownCount: files.length,
    truncated,
    folders: folderSet.size,
    extensions: Array.from(extensionSet).sort(),
    totalSize,
    averageSize: Math.round(totalSize / files.length),
  }
}

const groupFilesByFolder = (files: OptimizedMarkdownFile[]) => {
  const groups: Record<string, OptimizedMarkdownFile[]> = {}
  
  for (const file of files) {
    if (!groups[file.folder]) groups[file.folder] = []
    groups[file.folder].push(file)
  }
  
  // Sort files within each folder
  for (const folder in groups) {
    groups[folder].sort((a, b) => a.name.localeCompare(b.name))
  }
  
  return groups
}

// Error response helper
const errorResponse = (message: string, status: number, details?: Record<string, unknown>) => {
  return NextResponse.json(
    { 
      error: message,
      timestamp: new Date().toISOString(),
      ...details
    },
    { status }
  )
}

// Main handler
export async function GET(request: NextRequest) {
  try {
    // Parse and validate input
    const { searchParams } = new URL(request.url)
    const envVars = validateEnvVars()
    const queryParams = parseQueryParams(searchParams)
    
    const config: Config = {
      ...envVars,
      ...queryParams,
    }

    // Get branch SHA
    const commitSha = await findBranch(config, config.branch)
    
    // Fetch repository tree
    const treeData = await fetchRepoTree(config, commitSha)
    
    // Process markdown files efficiently
    const markdownFiles: OptimizedMarkdownFile[] = []
    
    for (const item of treeData.tree) {
      if (item.type === "blob" && isMarkdownFile(item.path, config.maxSize, item.size)) {
        markdownFiles.push(processMarkdownFile(item, config))
      }
    }
    
    // Sort files by path for consistent results
    markdownFiles.sort((a, b) => a.path.localeCompare(b.path))
    
    // Build response
    const response: Record<string, unknown> = {
      repository: `${config.owner}/${config.repo}`,
      branch: config.branch,
      commit: commitSha.substring(0, 8),
      files: markdownFiles,
    }
    
    // Add optional data based on query params
    if (config.includeStats) {
      response.stats = calculateStats(markdownFiles, treeData.tree.length, treeData.truncated)
    }
    
    if (config.groupByFolder && markdownFiles.length > 0) {
      const groups = groupFilesByFolder(markdownFiles)
      response.folders = Object.keys(groups).sort()
      response.groupedByFolder = groups
    }
    
    // Log summary
    console.log(`✅ Found ${markdownFiles.length} markdown files in ${config.owner}/${config.repo}@${config.branch}`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("GitHub fetcher error:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("environment variables")) {
        return errorResponse("Configuration error", 500, { 
          details: "Check environment variables configuration" 
        })
      }
      
      if (error.message.includes("branches found")) {
        return errorResponse("Repository access error", 404, {
          details: "Check repository permissions and branch names"
        })
      }
      
      if (error.message.includes("GitHub API error")) {
        return errorResponse(error.message, 403)
      }
    }
    
    return errorResponse("Internal server error", 500, {
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

// Optimized batch content fetcher
export async function POST(request: NextRequest) {
  try {
    const { paths, branch = "main" } = await request.json()
    
    if (!Array.isArray(paths) || paths.length === 0) {
      return errorResponse("Invalid request: 'paths' must be a non-empty array", 400)
    }
    
    if (paths.length > 50) {
      return errorResponse("Too many files requested (max 50)", 400)
    }
    
    const { owner, repo, token } = validateEnvVars()
    const headers = createHeaders(token)
    
    // Batch fetch with concurrency control
    const BATCH_SIZE = 10
    const results: Array<{ path: string; content?: string; error?: string; size?: number }> = []
    
    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
      const batch = paths.slice(i, i + BATCH_SIZE)
      
      const batchResults = await Promise.allSettled(
        batch.map(async (path: string) => {
          try {
            const response = await fetchWithRetry(
              `${API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
              { headers }
            )
            
            const data = await response.json()
            
            return {
              path,
              content: Buffer.from(data.content, 'base64').toString('utf-8'),
              size: data.size,
            }
          } catch (error) {
            return {
              path,
              error: error instanceof Error ? error.message : "Failed to fetch content"
            }
          }
        })
      )
      
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled'
          ? result.value
          : { path: (result as PromiseRejectedResult & { reason?: { path?: string } }).reason?.path ?? '', error: (result as PromiseRejectedResult).reason instanceof Error ? (result as PromiseRejectedResult).reason.message : String((result as PromiseRejectedResult).reason) }
      ))
    }
    
    const successful = results.filter(r => !r.error)
    
    return NextResponse.json({
      requested: paths.length,
      successful: successful.length,
      failed: results.length - successful.length,
      results,
    })
    
  } catch (error) {
    console.error("POST batch error:", error)
    return errorResponse("Failed to process batch request", 500)
  }
}