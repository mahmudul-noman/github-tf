import { type NextRequest, NextResponse } from "next/server"
import { createGitHubClient } from "@/lib/github"
import { createMarkdownFile } from "@/lib/markdown"

export async function POST(request: NextRequest) {
  try {
    const { drafts } = await request.json()

    if (!Array.isArray(drafts) || drafts.length === 0) {
      return NextResponse.json({ error: "Drafts array is required and must not be empty" }, { status: 400 })
    }

    const github = createGitHubClient()
    const results = []
    const errors = []

    for (const draft of drafts) {
      try {
        const { title, content, slug } = draft

        if (!title || !content) {
          errors.push({ draft: draft.id, error: "Missing title or content" })
          continue
        }

        // Generate filename from slug or title
        const filename = slug
          ? `${slug}.md`
          : `${title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")}.md`

        // Create markdown file with frontmatter
        const markdownContent = createMarkdownFile(title, content, {
          slug: slug || filename.replace(".md", ""),
          draft: false,
          publishedAt: new Date().toISOString(),
        })

        // Check if file already exists
        let existingFile = null
        try {
          const response = await fetch(`/api/github/content?path=${encodeURIComponent(filename)}`)
          if (response.ok) {
            existingFile = await response.json()
          }
        } catch (error) {
          // File doesn't exist, which is fine for new posts
        }

        const commitMessage = existingFile ? `Update post: ${title}` : `Add new post: ${title}`

        const result = await github.createOrUpdateFile(filename, markdownContent, commitMessage, existingFile?.sha)

        results.push({
          draftId: draft.id,
          filename,
          commit: result,
          url: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/blob/main/${filename}`,
        })
      } catch (error) {
        console.error(`Error publishing draft ${draft.id}:`, error)
        errors.push({
          draft: draft.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      published: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error("Error in batch publish:", error)
    return NextResponse.json({ error: "Failed to publish drafts" }, { status: 500 })
  }
}
