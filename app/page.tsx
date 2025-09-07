"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDrafts } from "@/hooks/use-drafts";
import type { Draft } from "@/lib/drafts";
import type { GitHubFile } from "@/lib/github";
import {
  Plus,
  Search,
  FileText,
  GitBranch,
  Clock,
  Edit,
  Trash2,
  Copy,
  Upload,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PublishDialog } from "@/components/publish-dialog";
import { PublishAllDialog } from "@/components/publish-all-dialog";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  BookOpen,
  CheckCircle,
  FileText as FileTextIcon,
} from "lucide-react";

interface APIResponse {
  files?: GitHubFile[];
  total?: number;
  markdownCount?: number;
  success?: boolean;
  error?: string;
}

export default function Dashboard() {
  const { drafts, createDraft, deleteDraft, duplicateDraft } = useDrafts();
  const [publishedPosts, setPublishedPosts] = useState<GitHubFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishAllDialogOpen, setPublishAllDialogOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [userManualOpen, setUserManualOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  const fetchPublishedPosts = async () => {
    try {
      setIsLoadingPosts(true);
      setPostsError(null);

      const response = await fetch("/api/github/files");

      // console.log("response", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse | GitHubFile[] = await response.json();

      // Handle different response formats
      let posts: GitHubFile[] = [];

      if (Array.isArray(data)) {
        // Direct array response
        posts = data;
      } else if (
        data &&
        typeof data === "object" &&
        "files" in data &&
        Array.isArray(data.files)
      ) {
        // Object with files property
        posts = data.files;
      } else if (data && typeof data === "object" && "error" in data) {
        // Error response
        throw new Error(data.error || "API returned an error");
      } else {
        console.warn("Unexpected API response format:", data);
        posts = [];
      }

      setPublishedPosts(posts);
      // console.log(`Loaded ${posts.length} published posts`);
    } catch (error) {
      console.error("Error fetching published posts:", error);
      setPostsError(
        error instanceof Error
          ? error.message
          : "Failed to fetch published posts"
      );
      setPublishedPosts([]); // Reset to empty array on error
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Safe filtering with better error handling
  const filteredPosts = Array.isArray(publishedPosts)
    ? publishedPosts.filter((post) => {
      if (!post || typeof post.name !== "string") {
        console.warn("Invalid post object:", post);
        return false;
      }
      return post.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    : [];

  // const handleCreateDraft = () => {
  //   const newDraft = createDraft()
  //   window.location.href = `/editor/${newDraft.id}`
  // }

  const handleCreateDraft = () => {
    const newDraft = createDraft();
    router.push(`/editor/${newDraft.id}`); // client-side navigation
  };

  const handleDeleteDraft = (id: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      deleteDraft(id);
    }
  };

  const handleDeleteAllDrafts = () => {
    if (
      confirm(
        "Are you sure you want to delete ALL drafts? This action cannot be undone."
      )
    ) {
      drafts.forEach((draft) => deleteDraft(draft.id));
    }
  };

  const handleDuplicateDraft = (id: string) => {
    duplicateDraft(id);
  };

  const handlePublishDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setPublishDialogOpen(true);
  };

  const handlePublishAll = () => {
    setPublishAllDialogOpen(true);
  };

  const handlePublished = (draftId?: string) => {
    // Refresh published posts
    fetchPublishedPosts();

    // Remove the draft from draft list if draftId is provided
    if (draftId) {
      deleteDraft(draftId);
    }
  };


  const handleRetryFetchPosts = () => {
    fetchPublishedPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              GitHub CMS by Mahmudul Hasan
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your blog posts and drafts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {drafts.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePublishAll}
                  className="bg-green-50 hover:bg-green-500 border-green-300 text-green-700 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Publish All ({drafts.length})
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllDrafts}
                  className="bg-red-50 hover:bg-red-500 border-red-300 text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </>
            )}
            <Button
              onClick={() => setUserManualOpen(true)}
              variant="outline"
              className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-500 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
              User Manual
            </Button>
            <Button
              onClick={handleCreateDraft}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Draft
            </Button>
          </div>
        </div>


        {/* User Manual Modal */}
        {userManualOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  GitHub CMS - User Manual
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setUserManualOpen(false)}
                  className="h-8 w-8 p-0 rounded-full cursor-pointer"
                >
                  ×
                </Button>
              </div>

              <div className="p-6 space-y-8">
                {/* Overview Section */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    📋 Application Overview
                  </h3>
                  <p className="text-gray-600 mb-4">
                    GitHub CMS is a content management system that allows you to
                    create, manage, and publish Markdown content directly to
                    your GitHub repository.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Key Features:
                    </h4>
                    <ul className="list-disc pl-5 text-blue-700 space-y-1">
                      <li>Create and edit Markdown content drafts</li>
                      <li>Preview content before publishing</li>
                      <li>Publish individual or multiple drafts to GitHub</li>
                      <li>View and manage published content</li>
                      <li>Search through drafts and published posts</li>
                    </ul>
                  </div>
                </section>

                {/* Dashboard Features */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    🏠 Dashboard Features
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <FileTextIcon className="h-5 w-5" />
                        Drafts Management
                      </h4>
                      <ul className="space-y-2 text-green-700">
                        <li>
                          <strong>New Draft:</strong> Create new content from
                          scratch
                        </li>
                        <li>
                          <strong>Edit:</strong> Modify existing drafts
                        </li>
                        <li>
                          <strong>Duplicate:</strong> Copy drafts as templates
                        </li>
                        <li>
                          <strong>Delete:</strong> Remove individual or all
                          drafts
                        </li>
                        <li>
                          <strong>Search:</strong> Find drafts by title or
                          content
                        </li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Published Content
                      </h4>
                      <ul className="space-y-2 text-purple-700">
                        <li>
                          <strong>View Posts:</strong> See all published content
                        </li>
                        <li>
                          <strong>GitHub Link:</strong> Open files directly on
                          GitHub
                        </li>
                        <li>
                          <strong>Preview:</strong> See how content renders
                        </li>
                        <li>
                          <strong>Auto-refresh:</strong> Content updates
                          automatically
                        </li>
                        <li>
                          <strong>Search:</strong> Filter published posts
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Publishing Workflow */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    🚀 Publishing Workflow
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Step-by-Step Process:
                    </h4>
                    <ol className="list-decimal pl-5 space-y-3 text-gray-600">
                      <li>
                        <strong>Create Content:</strong> Click "New Draft" and
                        write your Markdown content
                      </li>
                      <li>
                        <strong>Edit & Preview:</strong> Use the editor to
                        refine your content and preview how it will look
                      </li>
                      <li>
                        <strong>Publish Options:</strong>
                        <ul className="list-disc pl-5 mt-2 text-gray-500">
                          <li>
                            Publish individual drafts using the "Publish" button
                          </li>
                          <li>
                            Use "Publish All" to commit multiple drafts at once
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>Verification:</strong> Check the Published Posts
                        section to confirm your content was successfully pushed
                        to GitHub
                      </li>
                    </ol>
                  </div>
                </section>

                {/* File Management */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    📁 File Management
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-3">
                        Naming Convention
                      </h4>
                      <ul className="space-y-2 text-orange-700">
                        <li>
                          Draft titles are converted to kebab-case filenames
                        </li>
                        <li>Example: "My Blog Post" → "my-blog-post.md"</li>
                        <li>
                          Files are saved in your configured content directory
                        </li>
                        <li>Special characters are automatically handled</li>
                      </ul>
                    </div>

                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h4 className="font-semibold text-teal-800 mb-3">
                        Content Structure
                      </h4>
                      <ul className="space-y-2 text-teal-700">
                        <li>Standard Markdown format (.md files)</li>
                        <li>Automatic commit messages with timestamps</li>
                        <li>Main branch updates by default</li>
                        <li>File size and metadata tracking</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Best Practices */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    💡 Best Practices
                  </h3>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Content Creation
                        </h4>
                        <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                          <li>Use descriptive, unique titles</li>
                          <li>Save drafts frequently while editing</li>
                          <li>Preview content before publishing</li>
                          <li>
                            Use Markdown formatting for better readability
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Workflow Tips
                        </h4>
                        <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                          <li>Use search to quickly find content</li>
                          <li>Duplicate drafts for similar content types</li>
                          <li>Verify published content on GitHub</li>
                          <li>Check the stats panel for activity overview</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Troubleshooting */}
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    🔧 Troubleshooting
                  </h3>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Common Issues
                    </h4>
                    <ul className="list-disc pl-5 text-red-700 space-y-2">
                      <li>
                        <strong>Publishing fails:</strong> Check repository
                        permissions and internet connection
                      </li>
                      <li>
                        <strong>Content not appearing:</strong> Refresh the
                        published posts section
                      </li>
                      <li>
                        <strong>Search not working:</strong> Clear search field
                        and try again
                      </li>
                      <li>
                        <strong>Editor issues:</strong> Refresh the page and
                        ensure browser is updated
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Support Section */}
                <section className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    ❓ Need Help?
                  </h3>
                  <p className="text-gray-600 mb-3">
                    If you encounter any issues or have questions about using
                    this CMS:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Check the GitHub repository documentation</li>
                    <li>Review the browser console for error details</li>
                    <li>
                      Ensure your repository settings are correctly configured
                    </li>
                    <li>Contact support for persistent issues</li>
                  </ul>
                </section>
              </div>

              <div className="flex justify-end p-6 border-t sticky bottom-0 bg-white">
                <Button
                  onClick={() => setUserManualOpen(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  Got it, thanks!
                </Button>
              </div>
            </div>
          </div>
        )}

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
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Drafts
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {drafts.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Published Posts
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-orange-800">
                Recent Activity
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {drafts.length > 0
                  ? formatDistanceToNow(new Date(drafts[0].updatedAt), {
                    addSuffix: true,
                  })
                  : "None"}
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
                      <Button
                        onClick={handleCreateDraft}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
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
              <h2 className="text-xl font-semibold text-gray-800">
                Published Posts
              </h2>
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
                filteredPosts.map((post) => (
                  <PostCard key={post.path} post={post} />
                ))
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
            onPublished={() => handlePublished(selectedDraft?.id)}
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
  );
}

function DraftCard({
  draft,
  onDelete,
  onDuplicate,
  onPublish,
}: {
  draft: Draft;
  onDelete: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
}) {
  const wordCount = draft.content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return (
    <Card className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate text-blue-900 text-wrap">
              {draft.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1 text-blue-700">
              <span>{wordCount} words</span>
              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(draft.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="ml-2 border-blue-400 text-blue-700"
          >
            Draft
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-blue-800 line-clamp-2 mb-4">
          {draft.content.substring(0, 120)}...
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            asChild
            size="sm"
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Link href={`/editor/${draft.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onPublish}
            className="border-green-300 text-green-700 hover:bg-green-500 cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-1" />
            Publish
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onDuplicate}
            className="border-orange-300 text-orange-700 hover:bg-orange-500 cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-red-300 text-red-700 hover:bg-red-500 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post }: { post: GitHubFile }) {
  // Safety check for post object
  if (!post || typeof post.name !== "string") {
    return null;
  }

  const fileName = post.name.replace(".md", "");

  return (
    <Card className="hover:shadow-md transition-shadow border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate text-green-900 text-wrap">
              {fileName}
            </CardTitle>
            <CardDescription className="mt-1 text-green-700">
              {post.size
                ? `${(post.size / 1024).toFixed(1)} KB`
                : "Size unknown"}
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
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-500"
            >
              <a href={post.html_url} target="_blank" rel="noopener noreferrer">
                <GitBranch className="h-4 w-4 mr-1" />
                View on GitHub
              </a>
            </Button>
          )}

          {post.path && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-500"
            >
              <Link href={`/preview/${encodeURIComponent(post.path)}`}>
                <FileText className="h-4 w-4 mr-1" />
                Preview
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
