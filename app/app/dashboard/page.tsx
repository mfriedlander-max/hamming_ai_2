"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { useFolders } from "@/lib/hooks/useFolders";
import { formatDistanceToNow } from "date-fns";
import { ProjectSkeleton } from "@/components/loading/ProjectSkeleton";
import { EmptyProjects } from "@/components/empty/EmptyProjects";
import { FolderCard } from "@/components/dashboard/FolderCard";
import type { ProjectStatus } from "@/lib/db/projects";
import { ChevronRight, FolderPlus, History } from "lucide-react";
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from "@/types/folder";

function getStatusBadgeVariant(status: ProjectStatus["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "needs-analysis":
      return "destructive";
    case "pending-suggestions":
      return "default";
    case "up-to-date":
      return "secondary";
    default:
      return "outline";
  }
}

export default function DashboardPage() {
  const projectOptions = useMemo(() => ({ includeStatus: true }), []);
  const { projectsWithStatus, loading: projectsLoading } = useProjects(projectOptions);
  const {
    folders,
    currentFolderId,
    currentFolder,
    loading: foldersLoading,
    isInSubfolder,
    createFolder,
    deleteFolder,
    renameFolder,
    navigateToFolder,
  } = useFolders();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter projects by current folder
  const filteredProjects = useMemo(() => {
    return projectsWithStatus.filter((project) => project.folderId === currentFolderId);
  }, [projectsWithStatus, currentFolderId]);

  // Get folders to display (all non-current folders, excluding default when in default)
  const displayFolders = useMemo(() => {
    return folders.filter((folder) => {
      // Don't show the current folder we're in
      if (folder.id === currentFolderId) return false;
      // When in default folder, show all other folders
      // When in a subfolder, don't show other folders (single-level navigation)
      if (isInSubfolder) return false;
      return true;
    });
  }, [folders, currentFolderId, isInSubfolder]);

  const loading = projectsLoading || foldersLoading;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsSubmitting(true);
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToRoot = () => {
    navigateToFolder(DEFAULT_FOLDER_ID);
  };

  if (loading) {
    return (
      <PageContainer>
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-live="polite"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectSkeleton key={index} />
          ))}
        </div>
      </PageContainer>
    );
  }

  const currentFolderName = currentFolder?.name || DEFAULT_FOLDER_NAME;

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-gray-500">
          <li>
            {isInSubfolder ? (
              <button
                onClick={handleNavigateToRoot}
                className="hover:text-gray-900 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <span className="font-medium text-gray-900">Dashboard</span>
            )}
          </li>
          {isInSubfolder && (
            <>
              <li>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li>
                <span className="font-medium text-gray-900">{currentFolderName}</span>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isInSubfolder ? currentFolderName : "Projects"}
        </h1>
        <div className="flex items-center gap-2">
          {!isInSubfolder && (
            <Button variant="outline" onClick={() => setIsCreatingFolder(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          )}
          <Link href="/projects/new">
            <Button>New Analysis</Button>
          </Link>
        </div>
      </div>

      {/* Folders Section (only when in root/default folder) */}
      {displayFolders.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Folders</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onNavigate={navigateToFolder}
                onRename={renameFolder}
                onDelete={deleteFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {filteredProjects.length === 0 ? (
        <EmptyProjects isInSubfolder={isInSubfolder} folderName={currentFolderName} />
      ) : (
        <>
          {displayFolders.length > 0 && (
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Projects</h2>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="transition-smooth p-6 hover:shadow-md">
                <Link href={`/projects/${project.id}`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <Badge
                      variant={getStatusBadgeVariant(project.projectStatus.status)}
                      className="shrink-0"
                    >
                      {project.projectStatus.label}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {project.projectStatus.passRate !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {project.projectStatus.passRate}% pass rate
                      </Badge>
                    )}
                    {project.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                  </p>
                  {project.projectStatus.hasVersions && (
                    <Link
                      href={`/projects/${project.id}/history`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" title="View History">
                        <History className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={isSubmitting || !newFolderName.trim()}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
