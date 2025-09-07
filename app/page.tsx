"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useDrafts } from "@/hooks/use-drafts"
import type { Draft } from "@/lib/drafts"
import type { GitHubFile } from "@/lib/github"
import { Plus, Search, FileText, GitBranch, Clock, Edit, Trash2, Copy, Upload, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { PublishDialog } from "@/components/publish-dialog"
import { PublishAllDialog } from "@/components/publish-all-dialog"

interface APIResponse {
  files?: GitHubFile[]
  total?: number
  markdownCount?: number
  success?: boolean
  error?: string
}

export default function Dashboard() {
  const { drafts, createDraft, deleteDraft, duplicateDraft } = useDrafts()
  const [publishedPosts, setPublishedPosts] = useState<GitHubFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)

  useEffect(() => {
    fetchPublishedPosts()
  }, [])

  const fetchPublishedPosts = async () => {
    try {
      setIsLoadingPosts(true)
      setPostsError(null)
      
      const response = await fetch("/api/github/files")
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: APIResponse | GitHubFile[] = await response.json()
      
      // Handle different response formats
      let posts: GitHubFile[] = []
      
      if (Array.isArray(data)) {
        // Direct array response
        posts = data
      } else if (data && typeof data === 'object' && 'files' in data && Array.isArray(data.files)) {
        // Object with files property
        posts = data.files
      } else if (data && typeof data === 'object' && 'error' in data) {
        // Error response
        throw new Error(data.error || 'API returned an error')
      } else {
        console.warn('Unexpected API response format:', data)
        posts = []
      }
      
      setPublishedPosts(posts)
      console.log(`Loaded ${posts.length} published posts`)
      
    } catch (error) {
      console.error("Error fetching published posts:", error)
      setPostsError(error instanceof Error ? error.message : 'Failed to fetch published posts')
      setPublishedPosts([]) // Reset to empty array on error
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Safe filtering with better error handling
  const filteredPosts = Array.isArray(publishedPosts) 
    ? publishedPosts.filter((post) => {
        if (!post || typeof post.name !== 'string') {
          console.warn('Invalid post object:', post)
          return false
        }
        return post.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : []

  const handleCreateDraft = () => {
    const newDraft = createDraft()
    window.location.href = `/editor/${newDraft.id}`
  }

  const handleDeleteDraft = (id: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      deleteDraft(id)
    }
  }

  const handleDeleteAllDrafts = () => {
    if (confirm("Are you sure you want to delete ALL drafts? This action cannot be undone.")) {
      drafts.forEach((draft) => deleteDraft(draft.id))
    }
  }

  const handleDuplicateDraft = (id: string) => {
    duplicateDraft(id)
  }

  const handlePublishDraft = (draft: Draft) => {
    setSelectedDraft(draft)
    setPublishDialogOpen(true)
  }

  const handlePublishAll = () => {
    setPublishAllDialogOpen(true)
  }

  const handlePublished = () => {
    fetchPublishedPosts()
  }

  const handleRetryFetchPosts = () => {
    fetchPublishedPosts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">GitHub CMS by Mahmudul Hasan</h1>
            <p className="text-gray-500 mt-1">Manage your blog posts and drafts</p>
          </div>
          <div className="flex items-center gap-2">
            {drafts.length > 0 && (
              <>
                <Button variant="outline" onClick={handlePublishAll} className="bg-green-50 hover:bg-green-500 border-green-300 text-green-700 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Publish All ({drafts.length})
                </Button>
                <Button variant="destructive" onClick={handleDeleteAllDrafts} className="bg-red-50 hover:bg-red-500 border-red-300 text-red-700 cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </>
            )}
            <Button onClick={handleCreateDraft} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <Plus className="h-4 w-4" />
              New Draft
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search drafts and posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:ring-blue-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Drafts</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{drafts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Published Posts</CardTitle>
              <GitBranch className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {isLoadingPosts ? "..." : publishedPosts.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {drafts.length > 0 ? formatDistanceToNow(new Date(drafts[0].updatedAt), { addSuffix: true }) : "None"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drafts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Drafts</h2>
              <Badge variant="secondary">{filteredDrafts.length}</Badge>
            </div>

            <div className="space-y-3">
              {filteredDrafts.length === 0 ? (
                <Card className="border-dashed border-gray-300 bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      {searchQuery
                        ? "No drafts match your search."
                        : "No drafts yet. Create your first draft to get started."}
                    </p>
                    {!searchQuery && (
                      <Button onClick={handleCreateDraft} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                        Create Draft
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredDrafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onDelete={() => handleDeleteDraft(draft.id)}
                    onDuplicate={() => handleDuplicateDraft(draft.id)}
                    onPublish={() => handlePublishDraft(draft)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Published Posts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Published Posts</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{filteredPosts.length}</Badge>
                {postsError && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryFetchPosts}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {isLoadingPosts ? (
                <Card className="bg-white">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span>Loading posts...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : postsError ? (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                    <p className="text-red-600 text-center mb-4">
                      Error loading published posts: {postsError}
                    </p>
                    <Button 
                      onClick={handleRetryFetchPosts}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="border-dashed border-gray-300 bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      {searchQuery
                        ? "No published posts match your search."
                        : "No published posts found in your repository."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => <PostCard key={post.path} post={post} />)
              )}
            </div>
          </div>
        </div>

        {/* Publish Dialogs */}
        {selectedDraft && (
          <PublishDialog
            draft={selectedDraft}
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
            onPublished={handlePublished}
          />
        )}

        <PublishAllDialog
          drafts={drafts}
          open={publishAllDialogOpen}
          onOpenChange={setPublishAllDialogOpen}
          onPublished={handlePublished}
        />
      </div>
    </div>
  )
}

function DraftCard({
  draft,
  onDelete,
  onDuplicate,
  onPublish,
}: {
  draft: Draft
  onDelete: () => void
  onDuplicate: () => void
  onPublish: () => void
}) {
  const wordCount = draft.content.split(/\s+/).filter((word) => word.length > 0).length

  return (
    <Card className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate text-blue-900 text-wrap">{draft.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1 text-blue-700">
              <span>{wordCount} words</span>
              <span>Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2 border-blue-400 text-blue-700">
            Draft
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-blue-800 line-clamp-2 mb-4">{draft.content.substring(0, 120)}...</p>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            <Link href={`/editor/${draft.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>

          <Button size="sm" variant="outline" onClick={onPublish} className="border-green-300 text-green-700 hover:bg-green-500 cursor-pointer">
            <Upload className="h-4 w-4 mr-1" />
            Publish
          </Button>

          <Button size="sm" variant="outline" onClick={onDuplicate} className="border-orange-300 text-orange-700 hover:bg-orange-500 cursor-pointer">
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>

          <Button size="sm" variant="outline" onClick={onDelete} className="border-red-300 text-red-700 hover:bg-red-500 cursor-pointer">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PostCard({ post }: { post: GitHubFile }) {
  // Safety check for post object
  if (!post || typeof post.name !== 'string') {
    return null
  }

  const fileName = post.name.replace(".md", "")

  return (
    <Card className="hover:shadow-md transition-shadow border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate text-green-900 text-wrap">{fileName}</CardTitle>
            <CardDescription className="mt-1 text-green-700">
              {post.size ? `${(post.size / 1024).toFixed(1)} KB` : 'Size unknown'}
            </CardDescription>
          </div>
          <Badge variant="default" className="ml-2 bg-green-600 text-white">
            Published
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 flex-wrap">
          {post.html_url && (
            <Button asChild size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <a href={post.html_url} target="_blank" rel="noopener noreferrer">
                <GitBranch className="h-4 w-4 mr-1" />
                View on GitHub
              </a>
            </Button>
          )}

          {post.path && (
            <Button asChild size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              <Link href={`/preview/${encodeURIComponent(post.path)}`}>
                <FileText className="h-4 w-4 mr-1" />
                Preview
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}