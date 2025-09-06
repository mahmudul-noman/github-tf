import { type NextRequest, NextResponse } from "next/server"

interface GitHubTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
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

export async function GET(request: NextRequest) {
  try {
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_TOKEN

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "Missing GitHub environment variables" }, { status: 500 })
    }

    // First, get the latest commit SHA
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches/main`,
      {
        headers: { 
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!branchRes.ok) {
      // Try 'master' if 'main' doesn't exist
      const masterRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/master`,
        {
          headers: { 
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )
      
      if (!masterRes.ok) {
        return NextResponse.json({ error: "Could not find main or master branch" }, { status: 404 })
      }
    }

    const branchData = await (branchRes.ok ? branchRes : await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches/master`,
      {
        headers: { 
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )).json()

    const commitSha = branchData.commit.sha

    // Get the tree recursively
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      {
        headers: { 
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!treeRes.ok) {
      const errorData = await treeRes.json()
      console.error("GitHub Tree API error:", errorData)
      return NextResponse.json({ error: "Failed to fetch repository tree" }, { status: 500 })
    }

    const treeData: GitHubTreeResponse = await treeRes.json()

    // Filter for markdown files in the root directory only
    const markdownFiles = treeData.tree.filter(
      (item) => 
        item.type === 'blob' && 
        item.path.endsWith('.md') &&
        !item.path.includes('/') // Only root level files
    )

    // Transform to match your expected format
    const formattedFiles = markdownFiles.map(file => ({
      name: file.path,
      path: file.path,
      sha: file.sha,
      size: file.size,
      url: file.url,
      type: 'file' as const,
      download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`,
      git_url: file.url,
      html_url: `https://github.com/${owner}/${repo}/blob/main/${file.path}`,
      _links: {
        self: file.url,
        git: file.url,
        html: `https://github.com/${owner}/${repo}/blob/main/${file.path}`
      }
    }))

    console.log(`Total tree items: ${treeData.tree.length}, Markdown files in root: ${markdownFiles.length}`)
    console.log('Truncated:', treeData.truncated)

    return NextResponse.json({
      total: treeData.tree.length,
      markdownCount: markdownFiles.length,
      truncated: treeData.truncated,
      files: formattedFiles
    })

  } catch (error) {
    console.error("Error fetching GitHub tree:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}