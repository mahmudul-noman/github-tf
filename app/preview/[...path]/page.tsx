"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { parseMarkdown } from "@/lib/markdown"
import { ArrowLeft, GitBranch } from "lucide-react"
import Link from "next/link"

export default function PostPreviewPage() {
  const params = useParams()
  const path = Array.isArray(params.path) ? params.path.join("/") : params.path
  const [post, setPost] = useState<{ title: string; content: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (path) {
      fetchPost(decodeURIComponent(path))
    }
  }, [path])

  const fetchPost = async (filePath: string) => {
    try {
      const response = await fetch(`/api/github/content?path=${encodeURIComponent(filePath)}`)
      if (response.ok) {
        const { content } = await response.json()
        const parsed = parseMarkdown(content)
        setPost(parsed)
      } else {
        setError("Failed to fetch post content")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      setError("Error loading post")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground text-center mb-4">
              {error || "The post you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>

            <div>
              <h1 className="text-2xl font-bold">Preview Post</h1>
              <p className="text-sm text-muted-foreground mt-1">{path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">Published</Badge>

            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/blob/main/${path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-balance">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={post.content} showStats />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
