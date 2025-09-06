"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Draft } from "@/lib/drafts"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PublishDialogProps {
  draft: Draft
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublished?: (result: any) => void
}

export function PublishDialog({ draft, open, onOpenChange, onPublished }: PublishDialogProps) {
  const [filename, setFilename] = useState(
    draft.slug ||
      draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
  )
  const [customFrontmatter, setCustomFrontmatter] = useState("")
  const [addTimestamp, setAddTimestamp] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    setError(null)

    try {
      let frontmatter: Record<string, any> = {
        slug: filename,
        draft: false,
      }

      if (addTimestamp) {
        frontmatter.publishedAt = new Date().toISOString()
      }

      // Parse custom frontmatter if provided
      if (customFrontmatter.trim()) {
        try {
          const customData = JSON.parse(customFrontmatter)
          frontmatter = { ...frontmatter, ...customData }
        } catch (error) {
          setError("Invalid JSON in custom frontmatter")
          setIsPublishing(false)
          return
        }
      }

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title,
          content: draft.content,
          filename,
          frontmatter,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        onPublished?.(result)
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
        }, 2000)
      } else {
        setError(result.error || "Failed to publish post")
      }
    } catch (error) {
      console.error("Error publishing:", error)
      setError("Network error occurred while publishing")
    } finally {
      setIsPublishing(false)
    }
  }



  

  const handleClose = () => {
    if (!isPublishing) {
      onOpenChange(false)
      setError(null)
      setSuccess(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publish Draft
          </DialogTitle>
          <DialogDescription>Publish "{draft.title}" to your GitHub repository as a markdown file.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Post published successfully! Redirecting...</AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="my-blog-post"
                  disabled={isPublishing}
                />
                <span className="text-sm text-muted-foreground">.md</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="timestamp"
                checked={addTimestamp}
                // onCheckedChange={setAddTimestamp}
                onCheckedChange={(checked) => setAddTimestamp(checked === true)}
                disabled={isPublishing}
              />
              <Label htmlFor="timestamp" className="text-sm">
                Add publish timestamp
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frontmatter">Custom Frontmatter (JSON)</Label>
              <Textarea
                id="frontmatter"
                value={customFrontmatter}
                onChange={(e) => setCustomFrontmatter(e.target.value)}
                placeholder='{"author": "Your Name", "tags": ["blog", "tech"]}'
                rows={3}
                disabled={isPublishing}
              />
              <p className="text-xs text-muted-foreground">Optional: Add custom metadata as JSON</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPublishing} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing || success} className="cursor-pointer">
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
