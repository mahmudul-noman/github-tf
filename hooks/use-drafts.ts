"use client"

import { useState, useEffect, useCallback } from "react"
import { type Draft, draftManager } from "@/lib/drafts"

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshDrafts = useCallback(() => {
    setDrafts(draftManager.getAllDrafts())
  }, [])

  useEffect(() => {
    refreshDrafts()
    setIsLoading(false)
  }, [refreshDrafts])

  const createDraft = useCallback(
    (title?: string, content?: string) => {
      const newDraft = draftManager.createDraft(title, content)
      refreshDrafts()
      return newDraft
    },
    [refreshDrafts],
  )

  const updateDraft = useCallback(
    (id: string, updates: Partial<Pick<Draft, "title" | "content">>) => {
      const updatedDraft = draftManager.updateDraft(id, updates)
      refreshDrafts()
      return updatedDraft
    },
    [refreshDrafts],
  )

  const deleteDraft = useCallback(
    (id: string) => {
      const success = draftManager.deleteDraft(id)
      if (success) {
        refreshDrafts()
      }
      return success
    },
    [refreshDrafts],
  )

  const duplicateDraft = useCallback(
    (id: string) => {
      const newDraft = draftManager.duplicateDraft(id)
      if (newDraft) {
        refreshDrafts()
      }
      return newDraft
    },
    [refreshDrafts],
  )

  const clearAllDrafts = useCallback(() => {
    draftManager.clearAllDrafts()
    refreshDrafts()
  }, [refreshDrafts])

  return {
    drafts,
    isLoading,
    createDraft,
    updateDraft,
    deleteDraft,
    duplicateDraft,
    clearAllDrafts,
    refreshDrafts,
    getDraft: draftManager.getDraft.bind(draftManager),
    exportDrafts: draftManager.exportDrafts.bind(draftManager),
    importDrafts: draftManager.importDrafts.bind(draftManager),
    getDraftCount: draftManager.getDraftCount.bind(draftManager),
  }
}

export function useDraft(id: string | null) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setDraft(null)
      setIsLoading(false)
      return
    }

    const foundDraft = draftManager.getDraft(id)
    setDraft(foundDraft)
    setIsLoading(false)
  }, [id])

  const updateDraft = useCallback(
    (updates: Partial<Pick<Draft, "title" | "content">>) => {
      if (!id) return null

      const updatedDraft = draftManager.updateDraft(id, updates)
      setDraft(updatedDraft)
      return updatedDraft
    },
    [id],
  )

  return {
    draft,
    isLoading,
    updateDraft,
  }
}
