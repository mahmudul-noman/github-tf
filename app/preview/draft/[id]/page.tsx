"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useDraft } from "@/hooks/use-drafts"
import { ArrowLeft, Edit, Upload } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function DraftPreviewPage() {
  const params = useParams()
  const draftId = params.id as string
  const { draft, isLoading } = useDraft(draftId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <h2 className="text-xl font-semibold mb-2">Draft Not Found</h2>
            <p className="text-muted-foreground text-center mb-4">
              The draft you're looking for doesn't exist or has been deleted.
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
              <h1 className="text-2xl font-bold">Preview Draft</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Draft</Badge>

            <Button size="sm" variant="outline" asChild>
              <Link href={`/editor/${draft.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-balance">{draft.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={draft.content} showStats />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
