import { type NextRequest, NextResponse } from "next/server"
import { createGitHubClient } from "@/lib/github"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    const github = createGitHubClient()
    const content = await github.getFileContent(path)

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error fetching file content:", error)
    return NextResponse.json({ error: "Failed to fetch file content" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { path, content, message, sha } = await request.json()

    if (!path || !content || !message) {
      return NextResponse.json({ error: "Path, content, and message are required" }, { status: 400 })
    }

    const github = createGitHubClient()
    const result = await github.createOrUpdateFile(path, content, message, sha)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating file:", error)
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 })
  }
}
