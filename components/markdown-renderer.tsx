"use client"

import { useEffect, useState } from "react"
import { renderMarkdown, getMarkdownWordCount, getMarkdownReadingTime } from "@/lib/markdown"
import { Clock, FileText } from "lucide-react"

interface MarkdownRendererProps {
  content: string
  showStats?: boolean
  className?: string
}

export function MarkdownRenderer({ content, showStats = false, className = "" }: MarkdownRendererProps) {
  const [renderedHtml, setRenderedHtml] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    const html = renderMarkdown(content)
    setRenderedHtml(html)

    if (showStats) {
      setWordCount(getMarkdownWordCount(content))
      setReadingTime(getMarkdownReadingTime(content))
    }
  }, [content, showStats])

  return (
    <div className={`markdown-renderer ${className}`}>
      {showStats && (
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      )}

      <div
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  )
}
