export interface Draft {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  slug?: string
}

export class DraftManager {
  private storageKey = "github-cms-drafts"

  private generateId(): string {
    return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  private getStoredDrafts(): Draft[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading drafts from localStorage:", error)
      return []
    }
  }

  private saveDrafts(drafts: Draft[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(drafts))
    } catch (error) {
      console.error("Error saving drafts to localStorage:", error)
    }
  }

  getAllDrafts(): Draft[] {
    return this.getStoredDrafts().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  getDraft(id: string): Draft | null {
    const drafts = this.getStoredDrafts()
    return drafts.find((draft) => draft.id === id) || null
  }

  createDraft(title = "Untitled Draft", content = ""): Draft {
    const now = new Date().toISOString()
    const draft: Draft = {
      id: this.generateId(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      slug: this.generateSlug(title),
    }

    const drafts = this.getStoredDrafts()
    drafts.push(draft)
    this.saveDrafts(drafts)

    return draft
  }

  updateDraft(id: string, updates: Partial<Pick<Draft, "title" | "content">>): Draft | null {
    const drafts = this.getStoredDrafts()
    const index = drafts.findIndex((draft) => draft.id === id)

    if (index === -1) return null

    const updatedDraft = {
      ...drafts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    if (updates.title) {
      updatedDraft.slug = this.generateSlug(updates.title)
    }

    drafts[index] = updatedDraft
    this.saveDrafts(drafts)

    return updatedDraft
  }

  deleteDraft(id: string): boolean {
    const drafts = this.getStoredDrafts()
    const filteredDrafts = drafts.filter((draft) => draft.id !== id)

    if (filteredDrafts.length === drafts.length) {
      return false // Draft not found
    }

    this.saveDrafts(filteredDrafts)
    return true
  }

  duplicateDraft(id: string): Draft | null {
    const originalDraft = this.getDraft(id)
    if (!originalDraft) return null

    return this.createDraft(`${originalDraft.title} (Copy)`, originalDraft.content)
  }

  exportDrafts(): string {
    const drafts = this.getAllDrafts()
    return JSON.stringify(drafts, null, 2)
  }

  importDrafts(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importedDrafts = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0

      if (!Array.isArray(importedDrafts)) {
        return { success: false, imported: 0, errors: ["Invalid JSON format: expected array"] }
      }

      const existingDrafts = this.getStoredDrafts()

      importedDrafts.forEach((draft, index) => {
        try {
          if (!draft.title || !draft.content) {
            errors.push(`Draft ${index + 1}: missing title or content`)
            return
          }

          const newDraft = this.createDraft(draft.title, draft.content)
          imported++
        } catch (error) {
          errors.push(`Draft ${index + 1}: ${error instanceof Error ? error.message : "unknown error"}`)
        }
      })

      return { success: imported > 0, imported, errors }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`JSON parsing error: ${error instanceof Error ? error.message : "unknown error"}`],
      }
    }
  }

  clearAllDrafts(): void {
    this.saveDrafts([])
  }

  getDraftCount(): number {
    return this.getStoredDrafts().length
  }
}

// Singleton instance
export const draftManager = new DraftManager()
