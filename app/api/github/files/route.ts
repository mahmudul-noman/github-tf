import { type NextRequest, NextResponse } from "next/server"
import { createGitHubClient, type GitHubFile } from "@/lib/github"

export async function GET(request: NextRequest) {
  try {
    const github = createGitHubClient()
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO

    if (!owner || !repo) {
      return NextResponse.json({ error: "Missing GitHub environment variables" }, { status: 500 })
    }

    // Fetch all files in the repo root (adjust path if needed)
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
    })

    const data: GitHubFile[] = await res.json()

    if (!res.ok) {
      console.error("GitHub API error:", data)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    // Filter only markdown files
    const markdownFiles = data.filter((file) => file.type === "file" && file.name.endsWith(".md"))

    return NextResponse.json(markdownFiles)
  } catch (error) {
    console.error("Error fetching GitHub files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
