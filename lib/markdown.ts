import matter from "gray-matter"
import { marked } from "marked"

// Parse Markdown and extract frontmatter
export function parseMarkdown(raw: string) {
  const { data, content } = matter(raw)
  return { frontmatter: data, content }
}

// Convert Markdown to HTML
export function renderMarkdown(content: string) {
  return marked.parse(content)
}

// Utility: word count
export function getMarkdownWordCount(content: string) {
  return content.split(/\s+/).filter(Boolean).length
}

// Utility: reading time in minutes
export function getMarkdownReadingTime(content: string) {
  const wordsPerMinute = 200
  return Math.ceil(getMarkdownWordCount(content) / wordsPerMinute)
}

// lib/markdown.ts
export function createMarkdownFile(
  title: string,
  content: string,
  frontmatter?: Record<string, any>
) {
  const fm = frontmatter ? { title, ...frontmatter } : { title }
  const fmString = Object.entries(fm)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")

  return `---\n${fmString}\n---\n\n${content}`
}
