import { type NextRequest, NextResponse } from "next/server"
import { createGitHubClient } from "@/lib/github"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || ""

    const github = createGitHubClient()
    const files = await github.getMarkdownFiles(path)

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching GitHub files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
