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
import { Progress } from "@/components/ui/progress"
import type { Draft } from "@/lib/drafts"
import { Upload, AlertCircle, CheckCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface PublishAllDialogProps {
  drafts: Draft[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublished?: (results: any) => void
}

export function PublishAllDialog({ drafts, open, onOpenChange, onPublished }: PublishAllDialogProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePublishAll = async () => {
    setIsPublishing(true)
    setError(null)
    setProgress(0)

    try {
      const response = await fetch("/api/publish/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ drafts }),
      })

      const result = await response.json()
      setProgress(100)

      if (response.ok) {
        setResults(result)
        onPublished?.(result)
      } else {
        setError(result.error || "Failed to publish drafts")
      }
    } catch (error) {
      console.error("Error publishing drafts:", error)
      setError("Network error occurred while publishing")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleClose = () => {
    if (!isPublishing) {
      onOpenChange(false)
      setError(null)
      setResults(null)
      setProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publish All Drafts
          </DialogTitle>
          <DialogDescription>
            Publish all {drafts.length} drafts to your GitHub repository as markdown files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!results && !error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Drafts to publish:</span>
                <Badge className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {drafts.length}
                </Badge>

              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span style={{ whiteSpace: "wrap" }} className="truncate">{draft.title}</span>
                    </div>
                    {index !== drafts.length - 1 && <hr className="border-gray-300 w-full" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPublishing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Publishing drafts...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Published {results.published} of {drafts.length} drafts successfully
                  {results.failed > 0 && ` (${results.failed} failed)`}
                </AlertDescription>
              </Alert>

              {results.results.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Successfully Published:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.results.map((result: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="truncate">{result.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-destructive">Failed:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.errors.map((error: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        <span className="truncate">{error.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPublishing}>
            {results ? "Close" : "Cancel"}
          </Button>
          {!results && (
            <Button onClick={handlePublishAll} disabled={isPublishing || drafts.length === 0}>
              {isPublishing ? "Publishing..." : "Publish All"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
