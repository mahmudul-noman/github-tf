"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarkdownEditor } from "@/components/markdown-editor"
import { useDraft } from "@/hooks/use-drafts"
import { ArrowLeft, Save, Eye, Upload } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { PublishDialog } from "@/components/publish-dialog"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const draftId = params.id as string

  const { draft, isLoading, updateDraft } = useDraft(draftId)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  useEffect(() => {
    if (draft) {
      setTitle(draft.title)
      setContent(draft.content)
    }
  }, [draft])

  const handleSave = async () => {
    if (!draft) return

    setIsSaving(true)
    try {
      await updateDraft({ title, content })
      setLastSaved(new Date())
    } catch (error) {
      console.error("Error saving draft:", error)
    } finally {
      setIsSaving(false)
    }
  }


  const handlePublished = () => {
    router.push("/")
  }

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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
              <h1 className="text-2xl font-bold">Edit Draft</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Created {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}</span>
                <span>•</span>
                <span>Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
                {lastSaved && (
                  <>
                    <span>•</span>
                    <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Draft</Badge>

            <Button onClick={handleSave} disabled={isSaving} size="sm" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button size="sm" asChild>
              <Link href={`/preview/draft/${draft.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>

          </div>
        </div>

        {/* Title Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Markdown Editor */}
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your post content..."
        />
      </div>
    </div>
  )
}
