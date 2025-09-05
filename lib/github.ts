export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content?: string
  encoding?: string
}

export interface GitHubCommit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
}

export class GitHubAPI {
  private token: string
  private owner: string
  private repo: string
  private baseUrl = "https://api.github.com"

  constructor(token: string, owner: string, repo: string) {
    this.token = token
    this.owner = owner
    this.repo = repo
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getMarkdownFiles(path = ""): Promise<GitHubFile[]> {
    const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`
    const files = await this.request(endpoint)

    return Array.isArray(files) ? files.filter((file) => file.name.endsWith(".md")) : []
  }

  async getFileContent(path: string): Promise<string> {
    const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`
    const file = await this.request(endpoint)

    if (file.content && file.encoding === "base64") {
      return atob(file.content.replace(/\n/g, ""))
    }

    throw new Error("Unable to decode file content")
  }

  async createOrUpdateFile(path: string, content: string, message: string, sha?: string): Promise<GitHubCommit> {
    const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`
    const body: any = {
      message,
      content: btoa(content),
    }

    if (sha) {
      body.sha = sha
    }

    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async deleteFile(path: string, sha: string, message: string): Promise<GitHubCommit> {
    const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`
    return this.request(endpoint, {
      method: "DELETE",
      body: JSON.stringify({
        message,
        sha,
      }),
    })
  }
}

export function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    throw new Error("Missing required GitHub environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO")
  }

  return new GitHubAPI(token, owner, repo)
}
