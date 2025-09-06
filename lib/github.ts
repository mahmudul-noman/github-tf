export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  download_url: string
  type: string
}

export function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    throw new Error("Missing GitHub environment variables")
  }

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents`

  return {
    async createOrUpdateFile(path: string, content: string, message: string, sha?: string) {
      const res = await fetch(`${apiBase}/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString("base64"),
          sha,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        console.error("GitHub API error:", data)
        throw new Error(data.message || "Failed to create/update file")
      }
      return data
    },

    async getFileContent(path: string) {
      const res = await fetch(`${apiBase}/${path}`, {
        headers: { Authorization: `token ${token}` },
      })

      const data = await res.json()
      if (!res.ok) {
        console.error("GitHub API error:", data)
        throw new Error(data.message || "Failed to fetch file content")
      }

      // The content comes base64 encoded
      const decodedContent = Buffer.from(data.content, "base64").toString("utf-8")
      return decodedContent
    },
  }
}
