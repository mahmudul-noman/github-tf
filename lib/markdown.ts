import { marked } from "marked"
import DOMPurify from "isomorphic-dompurify"
import { markedHighlight } from "marked-highlight"
import hljs from "highlight.js"

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext"
      return hljs.highlight(code, { language }).value
    },
  }),
)

// Configure marked options for GitHub-flavored markdown
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
})

export interface MarkdownPost {
  title: string
  content: string
  frontmatter?: Record<string, any>
}

export function parseMarkdown(content: string): MarkdownPost {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (match) {
    const [, frontmatterStr, markdownContent] = match
    const frontmatter = parseFrontmatter(frontmatterStr)

    return {
      title: frontmatter.title || "Untitled",
      content: markdownContent.trim(),
      frontmatter,
    }
  }

  // Extract title from first heading or use filename
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : "Untitled"

  return {
    title,
    content: content.trim(),
  }
}

export function renderMarkdown(content: string): string {
  const html = marked(content)
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  })
}

export function getMarkdownWordCount(content: string): number {
  const plainText = content
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]*`/g, "") // Remove inline code
    .replace(/!\[.*?\]$$.*?$$/g, "") // Remove images
    .replace(/\[.*?\]$$.*?$$/g, "") // Remove links
    .replace(/[#*_~`]/g, "") // Remove markdown syntax
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()

  return plainText ? plainText.split(" ").length : 0
}

export function getMarkdownReadingTime(content: string): number {
  const wordCount = getMarkdownWordCount(content)
  const wordsPerMinute = 200 // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute)
}

export function extractMarkdownHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Array<{ level: number; text: string; id: string }> = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    headings.push({ level, text, id })
  }

  return headings
}

export function createMarkdownFile(title: string, content: string, frontmatter?: Record<string, any>): string {
  const fm = {
    title,
    date: new Date().toISOString().split("T")[0],
    ...frontmatter,
  }

  const frontmatterStr = Object.entries(fm)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")

  return `---\n${frontmatterStr}\n---\n\n${content}`
}

function parseFrontmatter(str: string): Record<string, any> {
  const result: Record<string, any> = {}

  str.split("\n").forEach((line) => {
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      try {
        result[key] = JSON.parse(value)
      } catch {
        result[key] = value
      }
    }
  })

  return result
}
