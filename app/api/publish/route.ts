import { type NextRequest, NextResponse } from "next/server"
import { createGitHubClient } from "@/lib/github"
import { createMarkdownFile } from "@/lib/markdown"

export async function POST(request: NextRequest) {
  try {
    const { title, content, filename, frontmatter } = await request.json()

    if (!title || !content || !filename) {
      return NextResponse.json({ error: "Title, content, and filename are required" }, { status: 400 })
    }

    // Ensure filename ends with .md
    const markdownFilename = filename.endsWith(".md") ? filename : `${filename}.md`

    // Create markdown file with frontmatter
    const markdownContent = createMarkdownFile(title, content, frontmatter)

    const github = createGitHubClient()

    // Check if file already exists
    let existingFile = null
    try {
      const response = await fetch(`/api/github/content?path=${encodeURIComponent(markdownFilename)}`)
      if (response.ok) {
        existingFile = await response.json()
      }
    } catch (error) {
      // File doesn't exist, which is fine for new posts
    }

    // Commit message
    const commitMessage = existingFile ? `Update post: ${title}` : `Add new post: ${title}`

    // Create or update the file
    const result = await github.createOrUpdateFile(markdownFilename, markdownContent, commitMessage, existingFile?.sha)

    return NextResponse.json({
      success: true,
      commit: result,
      filename: markdownFilename,
      url: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/blob/main/${markdownFilename}`,
    })
  } catch (error) {
    console.error("Error publishing post:", error)
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 })
  }
}
