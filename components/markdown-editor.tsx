"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "./markdown-renderer"
import { Eye, Edit, Split } from "lucide-react"
import { useAutoSave } from "@/lib/auto-save"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
  autoSave?: boolean
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  placeholder = "Start writing your markdown content...",
  autoSave = true,
  className = "",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSave = useCallback(() => {
    onSave?.()
  }, [onSave])

  const autoSaveInstance = useAutoSave(handleSave, 2000)

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue)
      if (autoSave) {
        autoSaveInstance.trigger()
      }
    },
    [onChange, autoSave, autoSaveInstance],
  )

  const insertMarkdown = useCallback(
    (before: string, after = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)

      onChange(newValue)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
      }, 0)
    },
    [value, onChange],
  )

  // const toolbarButtons = [
  //   { label: "Bold", action: () => insertMarkdown("**", "**"), shortcut: "Ctrl+B" },
  //   { label: "Italic", action: () => insertMarkdown("*", "*"), shortcut: "Ctrl+I" },
  //   { label: "Code", action: () => insertMarkdown("`", "`"), shortcut: "Ctrl+`" },
  //   { label: "Link", action: () => insertMarkdown("[", "](url)"), shortcut: "Ctrl+K" },
  //   { label: "Heading", action: () => insertMarkdown("## "), shortcut: "Ctrl+H" },
  //   { label: "List", action: () => insertMarkdown("- "), shortcut: "Ctrl+L" },
  // ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            insertMarkdown("**", "**")
            break
          case "i":
            e.preventDefault()
            insertMarkdown("*", "*")
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [insertMarkdown, handleSave])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Markdown Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="split" className="flex items-center gap-1">
                  <Split className="h-4 w-4" />
                  Split
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>


      </CardHeader>

      <CardContent>
        <div className="h-96">
          {activeTab === "edit" && (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="h-full resize-none font-mono text-sm"
            />
          )}

          {activeTab === "preview" && (
            <div className="h-full overflow-auto border rounded-md p-4">
              <MarkdownRenderer content={value} showStats />
            </div>
          )}

          {activeTab === "split" && (
            <div className="grid grid-cols-2 gap-4 h-full">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="h-full resize-none font-mono text-sm"
              />
              <div className="h-full overflow-auto border rounded-md p-4">
                <MarkdownRenderer content={value} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
