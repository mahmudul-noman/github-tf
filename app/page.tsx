// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { useDrafts } from "@/hooks/use-drafts"
// import type { Draft } from "@/lib/drafts"
// import type { GitHubFile } from "@/lib/github"
// import { Plus, Search, FileText, GitBranch, Clock, Edit, Trash2, Copy, Upload } from "lucide-react"
// import Link from "next/link"
// import { formatDistanceToNow } from "date-fns"
// import { PublishDialog } from "@/components/publish-dialog"
// import { PublishAllDialog } from "@/components/publish-all-dialog"

// export default function Dashboard() {
//   const { drafts, createDraft, deleteDraft, duplicateDraft } = useDrafts()
//   const [publishedPosts, setPublishedPosts] = useState<GitHubFile[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isLoadingPosts, setIsLoadingPosts] = useState(true)
//   const [publishDialogOpen, setPublishDialogOpen] = useState(false)
//   const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
//   const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)

//   useEffect(() => {
//     fetchPublishedPosts()
//   }, [])

//   const fetchPublishedPosts = async () => {
//     try {
//       const response = await fetch("/api/github/files")
//       if (response.ok) {
//         const files = await response.json()
//         setPublishedPosts(files)
//       }
//     } catch (error) {
//       console.error("Error fetching published posts:", error)
//     } finally {
//       setIsLoadingPosts(false)
//     }
//   }

//   const filteredDrafts = drafts.filter(
//     (draft) =>
//       draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       draft.content.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const filteredPosts = publishedPosts.filter((post) =>
//     post.name.toLowerCase().includes(searchQuery.toLowerCase())
//   )

//   const handleCreateDraft = () => {
//     const newDraft = createDraft()
//     window.location.href = `/editor/${newDraft.id}`
//   }

//   const handleDeleteDraft = (id: string) => {
//     if (confirm("Are you sure you want to delete this draft?")) {
//       deleteDraft(id)
//     }
//   }

//   const handleDeleteAllDrafts = () => {
//     if (confirm("Are you sure you want to delete ALL drafts? This action cannot be undone.")) {
//       drafts.forEach((draft) => deleteDraft(draft.id))
//     }
//   }

//   const handleDuplicateDraft = (id: string) => {
//     duplicateDraft(id)
//   }

//   const handlePublishDraft = (draft: Draft) => {
//     setSelectedDraft(draft)
//     setPublishDialogOpen(true)
//   }

//   const handlePublishAll = () => {
//     setPublishAllDialogOpen(true)
//   }

//   const handlePublished = () => {
//     fetchPublishedPosts()
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">GitHub CMS by Mahmudul Hasan</h1>
//             <p className="text-muted-foreground mt-1">Manage your blog posts and drafts</p>
//           </div>
//           <div className="flex items-center gap-2">
//             {drafts.length > 0 && (
//               <>
//                 <Button variant="outline" onClick={handlePublishAll}>
//                   <Upload className="h-4 w-4 mr-2" />
//                   Publish All ({drafts.length})
//                 </Button>
//                 <Button variant="destructive" onClick={handleDeleteAllDrafts}>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete All
//                 </Button>
//               </>
//             )}
//             <Button onClick={handleCreateDraft} className="flex items-center gap-2">
//               <Plus className="h-4 w-4" />
//               New Draft
//             </Button>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="relative mb-6">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search drafts and posts..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Drafts</CardTitle>
//               <FileText className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{drafts.length}</div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
//               <GitBranch className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{publishedPosts.length}</div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
//               <Clock className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {drafts.length > 0 ? formatDistanceToNow(new Date(drafts[0].updatedAt), { addSuffix: true }) : "None"}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Drafts Section */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold">Drafts</h2>
//               <Badge variant="secondary">{filteredDrafts.length}</Badge>
//             </div>

//             <div className="space-y-3">
//               {filteredDrafts.length === 0 ? (
//                 <Card>
//                   <CardContent className="flex flex-col items-center justify-center py-8">
//                     <FileText className="h-12 w-12 text-muted-foreground mb-4" />
//                     <p className="text-muted-foreground text-center">
//                       {searchQuery
//                         ? "No drafts match your search."
//                         : "No drafts yet. Create your first draft to get started."}
//                     </p>
//                     {!searchQuery && (
//                       <Button onClick={handleCreateDraft} className="mt-4">
//                         Create Draft
//                       </Button>
//                     )}
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredDrafts.map((draft) => (
//                   <DraftCard
//                     key={draft.id}
//                     draft={draft}
//                     onDelete={() => handleDeleteDraft(draft.id)}
//                     onDuplicate={() => handleDuplicateDraft(draft.id)}
//                     onPublish={() => handlePublishDraft(draft)}
//                   />
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Published Posts Section */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold">Published Posts</h2>
//               <Badge variant="secondary">{filteredPosts.length}</Badge>
//             </div>

//             <div className="space-y-3">
//               {isLoadingPosts ? (
//                 <Card>
//                   <CardContent className="flex items-center justify-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                   </CardContent>
//                 </Card>
//               ) : filteredPosts.length === 0 ? (
//                 <Card>
//                   <CardContent className="flex flex-col items-center justify-center py-8">
//                     <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
//                     <p className="text-muted-foreground text-center">
//                       {searchQuery
//                         ? "No published posts match your search."
//                         : "No published posts found in your repository."}
//                     </p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredPosts.map((post) => <PostCard key={post.path} post={post} />)
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Publish Dialogs */}
//         {selectedDraft && (
//           <PublishDialog
//             draft={selectedDraft}
//             open={publishDialogOpen}
//             onOpenChange={setPublishDialogOpen}
//             onPublished={handlePublished}
//           />
//         )}

//         <PublishAllDialog
//           drafts={drafts}
//           open={publishAllDialogOpen}
//           onOpenChange={setPublishAllDialogOpen}
//           onPublished={handlePublished}
//         />
//       </div>
//     </div>
//   )
// }

// function DraftCard({
//   draft,
//   onDelete,
//   onDuplicate,
//   onPublish,
// }: {
//   draft: Draft
//   onDelete: () => void
//   onDuplicate: () => void
//   onPublish: () => void
// }) {
//   const wordCount = draft.content.split(/\s+/).filter((word) => word.length > 0).length

//   return (
//     <Card className="hover:shadow-md transition-shadow">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex-1 min-w-0">
//             <CardTitle className="text-base truncate">{draft.title}</CardTitle>
//             <CardDescription className="flex items-center gap-4 mt-1">
//               <span>{wordCount} words</span>
//               <span>Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
//             </CardDescription>
//           </div>
//           <Badge variant="outline" className="ml-2">
//             Draft
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0">
//         <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{draft.content.substring(0, 120)}...</p>

//         <div className="flex items-center gap-2">
//           <Button asChild size="sm" variant="default">
//             <Link href={`/editor/${draft.id}`}>
//               <Edit className="h-4 w-4 mr-1" />
//               Edit
//             </Link>
//           </Button>

//           <Button size="sm" variant="outline" onClick={onPublish}>
//             <Upload className="h-4 w-4 mr-1" />
//             Publish
//           </Button>

//           <Button size="sm" variant="outline" onClick={onDuplicate}>
//             <Copy className="h-4 w-4 mr-1" />
//             Duplicate
//           </Button>

//           <Button size="sm" variant="outline" onClick={onDelete}>
//             <Trash2 className="h-4 w-4 mr-1" />
//             Delete
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function PostCard({ post }: { post: GitHubFile }) {
//   const fileName = post.name.replace(".md", "")

//   return (
//     <Card className="hover:shadow-md transition-shadow">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex-1 min-w-0">
//             <CardTitle className="text-base truncate">{fileName}</CardTitle>
//             <CardDescription className="mt-1">{(post.size / 1024).toFixed(1)} KB</CardDescription>
//           </div>
//           <Badge variant="default" className="ml-2">
//             Published
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0">
//         <div className="flex items-center gap-2">
//           <Button asChild size="sm" variant="outline">
//             <a href={post.html_url} target="_blank" rel="noopener noreferrer">
//               <GitBranch className="h-4 w-4 mr-1" />
//               View on GitHub
//             </a>
//           </Button>

//           <Button asChild size="sm" variant="outline">
//             <Link href={`/preview/${encodeURIComponent(post.path)}`}>
//               <FileText className="h-4 w-4 mr-1" />
//               Preview
//             </Link>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }



// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { useDrafts } from "@/hooks/use-drafts"
// import type { Draft } from "@/lib/drafts"
// import type { GitHubFile } from "@/lib/github"
// import { Plus, Search, FileText, GitBranch, Clock, Edit, Trash2, Copy, Upload } from "lucide-react"
// import Link from "next/link"
// import { formatDistanceToNow } from "date-fns"
// import { PublishDialog } from "@/components/publish-dialog"
// import { PublishAllDialog } from "@/components/publish-all-dialog"

// export default function Dashboard() {
//   const { drafts, createDraft, deleteDraft, duplicateDraft } = useDrafts()
//   const [publishedPosts, setPublishedPosts] = useState<GitHubFile[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isLoadingPosts, setIsLoadingPosts] = useState(true)
//   const [publishDialogOpen, setPublishDialogOpen] = useState(false)
//   const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
//   const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)

//   useEffect(() => {
//     fetchPublishedPosts()
//   }, [])

//   const fetchPublishedPosts = async () => {
//     try {
//       const response = await fetch("/api/github/files")
//       if (response.ok) {
//         const files = await response.json()
//         setPublishedPosts(files)
//       }
//     } catch (error) {
//       console.error("Error fetching published posts:", error)
//     } finally {
//       setIsLoadingPosts(false)
//     }
//   }

//   const filteredDrafts = drafts.filter(
//     (draft) =>
//       draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       draft.content.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const filteredPosts = publishedPosts.filter((post) =>
//     post.name.toLowerCase().includes(searchQuery.toLowerCase())
//   )

//   const handleCreateDraft = () => {
//     const newDraft = createDraft()
//     window.location.href = `/editor/${newDraft.id}`
//   }

//   const handleDeleteDraft = (id: string) => {
//     if (confirm("Are you sure you want to delete this draft?")) {
//       deleteDraft(id)
//     }
//   }

//   const handleDeleteAllDrafts = () => {
//     if (confirm("Are you sure you want to delete ALL drafts? This action cannot be undone.")) {
//       drafts.forEach((draft) => deleteDraft(draft.id))
//     }
//   }

//   const handleDuplicateDraft = (id: string) => {
//     duplicateDraft(id)
//   }

//   const handlePublishDraft = (draft: Draft) => {
//     setSelectedDraft(draft)
//     setPublishDialogOpen(true)
//   }

//   const handlePublishAll = () => {
//     setPublishAllDialogOpen(true)
//   }

// const handlePublished = (publishedDraftIds: string[] = []) => {
//   // Remove published drafts from local draft state
//   publishedDraftIds.forEach((id) => deleteDraft(id))
//   // Refetch published posts
//   fetchPublishedPosts()
// }


//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">GitHub CMS by Mahmudul Hasan</h1>
//             <p className="text-gray-500 mt-1">Manage your blog posts and drafts</p>
//           </div>
//           <div className="flex items-center gap-2">
//             {drafts.length > 0 && (
//               <>
//                 <Button variant="outline" onClick={handlePublishAll} className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700">
//                   <Upload className="h-4 w-4 mr-2" />
//                   Publish All ({drafts.length})
//                 </Button>
//                 <Button variant="destructive" onClick={handleDeleteAllDrafts} className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700">
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete All
//                 </Button>
//               </>
//             )}
//             <Button onClick={handleCreateDraft} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
//               <Plus className="h-4 w-4" />
//               New Draft
//             </Button>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="relative mb-6">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             placeholder="Search drafts and posts..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10 border-gray-300 focus:ring-blue-500"
//           />
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <Card className="bg-blue-50 border-blue-200">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-blue-800">Total Drafts</CardTitle>
//               <FileText className="h-4 w-4 text-blue-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-900">{drafts.length}</div>
//             </CardContent>
//           </Card>

//           <Card className="bg-green-50 border-green-200">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-green-800">Published Posts</CardTitle>
//               <GitBranch className="h-4 w-4 text-green-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-900">{publishedPosts.length}</div>
//             </CardContent>
//           </Card>

//           <Card className="bg-orange-50 border-orange-200">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-orange-800">Recent Activity</CardTitle>
//               <Clock className="h-4 w-4 text-orange-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-orange-900">
//                 {drafts.length > 0 ? formatDistanceToNow(new Date(drafts[0].updatedAt), { addSuffix: true }) : "None"}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Drafts Section */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold text-gray-800">Drafts</h2>
//               <Badge variant="secondary">{filteredDrafts.length}</Badge>
//             </div>

//             <div className="space-y-3">
//               {filteredDrafts.length === 0 ? (
//                 <Card className="border-dashed border-gray-300 bg-white">
//                   <CardContent className="flex flex-col items-center justify-center py-8">
//                     <FileText className="h-12 w-12 text-gray-400 mb-4" />
//                     <p className="text-gray-500 text-center">
//                       {searchQuery
//                         ? "No drafts match your search."
//                         : "No drafts yet. Create your first draft to get started."}
//                     </p>
//                     {!searchQuery && (
//                       <Button onClick={handleCreateDraft} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
//                         Create Draft
//                       </Button>
//                     )}
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredDrafts.map((draft) => (
//                   <DraftCard
//                     key={draft.id}
//                     draft={draft}
//                     onDelete={() => handleDeleteDraft(draft.id)}
//                     onDuplicate={() => handleDuplicateDraft(draft.id)}
//                     onPublish={() => handlePublishDraft(draft)}
//                   />
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Published Posts Section */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold text-gray-800">Published Posts</h2>
//               <Badge variant="secondary">{filteredPosts.length}</Badge>
//             </div>

//             <div className="space-y-3">
//               {isLoadingPosts ? (
//                 <Card className="bg-white">
//                   <CardContent className="flex items-center justify-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   </CardContent>
//                 </Card>
//               ) : filteredPosts.length === 0 ? (
//                 <Card className="border-dashed border-gray-300 bg-white">
//                   <CardContent className="flex flex-col items-center justify-center py-8">
//                     <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
//                     <p className="text-gray-500 text-center">
//                       {searchQuery
//                         ? "No published posts match your search."
//                         : "No published posts found in your repository."}
//                     </p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredPosts.map((post) => <PostCard key={post.path} post={post} />)
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Publish Dialogs */}
//         {selectedDraft && (
//           <PublishDialog
//             draft={selectedDraft}
//             open={publishDialogOpen}
//             onOpenChange={setPublishDialogOpen}
//             onPublished={handlePublished}
//           />
//         )}

//         <PublishAllDialog
//           drafts={drafts}
//           open={publishAllDialogOpen}
//           onOpenChange={setPublishAllDialogOpen}
//           onPublished={handlePublished}
//         />
//       </div>
//     </div>
//   )
// }

// function DraftCard({
//   draft,
//   onDelete,
//   onDuplicate,
//   onPublish,
// }: {
//   draft: Draft
//   onDelete: () => void
//   onDuplicate: () => void
//   onPublish: () => void
// }) {
//   const wordCount = draft.content.split(/\s+/).filter((word) => word.length > 0).length

//   return (
//     <Card className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex-1 min-w-0">
//             <CardTitle className="text-base truncate text-blue-900">{draft.title}</CardTitle>
//             <CardDescription className="flex items-center gap-4 mt-1 text-blue-700">
//               <span>{wordCount} words</span>
//               <span>Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
//             </CardDescription>
//           </div>
//           <Badge variant="outline" className="ml-2 border-blue-400 text-blue-700">
//             Draft
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0">
//         <p className="text-sm text-blue-800 line-clamp-2 mb-4">{draft.content.substring(0, 120)}...</p>

//         <div className="flex items-center gap-2">
//           <Button asChild size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
//             <Link href={`/editor/${draft.id}`}>
//               <Edit className="h-4 w-4 mr-1" />
//               Edit
//             </Link>
//           </Button>

//           <Button size="sm" variant="outline" onClick={onPublish} className="border-green-300 text-green-700 hover:bg-green-50">
//             <Upload className="h-4 w-4 mr-1" />
//             Publish
//           </Button>

//           <Button size="sm" variant="outline" onClick={onDuplicate} className="border-orange-300 text-orange-700 hover:bg-orange-50">
//             <Copy className="h-4 w-4 mr-1" />
//             Duplicate
//           </Button>

//           <Button size="sm" variant="outline" onClick={onDelete} className="border-red-300 text-red-700 hover:bg-red-50">
//             <Trash2 className="h-4 w-4 mr-1" />
//             Delete
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// function PostCard({ post }: { post: GitHubFile }) {
//   const fileName = post.name.replace(".md", "")

//   return (
//     <Card className="hover:shadow-md transition-shadow border-green-200 bg-green-50">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex-1 min-w-0">
//             <CardTitle className="text-base truncate text-green-900">{fileName}</CardTitle>
//             <CardDescription className="mt-1 text-green-700">{(post.size / 1024).toFixed(1)} KB</CardDescription>
//           </div>
//           <Badge variant="default" className="ml-2 bg-green-600 text-white">
//             Published
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0">
//         <div className="flex items-center gap-2">
//           <Button asChild size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
//             <a href={post.html_url} target="_blank" rel="noopener noreferrer">
//               <GitBranch className="h-4 w-4 mr-1" />
//               View on GitHub
//             </a>
//           </Button>

//           <Button asChild size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
//             <Link href={`/preview/${encodeURIComponent(post.path)}`}>
//               <FileText className="h-4 w-4 mr-1" />
//               Preview
//             </Link>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }




"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useDrafts } from "@/hooks/use-drafts"
import type { Draft } from "@/lib/drafts"
import type { GitHubFile } from "@/lib/github"
import { Plus, Search, FileText, GitBranch, Clock, Edit, Trash2, Copy, Upload } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { PublishDialog } from "@/components/publish-dialog"
import { PublishAllDialog } from "@/components/publish-all-dialog"

export default function Dashboard() {
  const { drafts, createDraft, deleteDraft, duplicateDraft } = useDrafts()
  const [publishedPosts, setPublishedPosts] = useState<GitHubFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)

  useEffect(() => {
    fetchPublishedPosts()
  }, [])

  const fetchPublishedPosts = async () => {
    try {
      const response = await fetch("/api/github/files")
      if (response.ok) {
        const files = await response.json()
        setPublishedPosts(files)
      }
    } catch (error) {
      console.error("Error fetching published posts:", error)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPosts = publishedPosts.filter((post) =>
    post.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                <Button variant="destructive" onClick={handleDeleteAllDrafts} className="bg-red-50 hover:bg-red-500 border-red-300 text-white-50 cursor-pointer">
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
              <div className="text-2xl font-bold text-green-900">{publishedPosts.length}</div>
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
              <Badge variant="secondary">{filteredPosts.length}</Badge>
            </div>

            <div className="space-y-3">
              {isLoadingPosts ? (
                <Card className="bg-white">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            onPublished={handlePublished} // <- updated
          />
        )}

        <PublishAllDialog
          drafts={drafts}
          open={publishAllDialogOpen}
          onOpenChange={setPublishAllDialogOpen}
          onPublished={handlePublished} // <- updated
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

        <div className="flex items-center gap-2">
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
  const fileName = post.name.replace(".md", "")

  return (
    <Card className="hover:shadow-md transition-shadow border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate text-green-900 text-wrap">{fileName}</CardTitle>
            <CardDescription className="mt-1 text-green-700">{(post.size / 1024).toFixed(1)} KB</CardDescription>
          </div>
          <Badge variant="default" className="ml-2 bg-green-600 text-white">
            Published
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-500">
            <a href={post.html_url} target="_blank" rel="noopener noreferrer">
              <GitBranch className="h-4 w-4 mr-1" />
              View on GitHub
            </a>
          </Button>

          <Button asChild size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-500">
            <Link href={`/preview/${encodeURIComponent(post.path)}`}>
              <FileText className="h-4 w-4 mr-1" />
              Preview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

