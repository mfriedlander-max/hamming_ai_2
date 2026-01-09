"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
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
import { ProjectSkeleton } from "@/components/loading/ProjectSkeleton";
import { EmptyProjects } from "@/components/empty/EmptyProjects";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { SortableProjectCard } from "@/components/dashboard/SortableProjectCard";
import { ChevronRight, FolderPlus } from "lucide-react";
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from "@/types/folder";

export default function DashboardPage() {
  const projectOptions = useMemo(() => ({ includeStatus: true }), []);
  const {
    projectsWithStatus,
    loading: projectsLoading,
    deleteProject,
    moveProjectToFolder,
    reorderProjects,
    renameProject,
  } = useProjects(projectOptions);
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filter and sort projects by current folder
  const filteredProjects = useMemo(() => {
    return projectsWithStatus
      .filter((project) => project.folderId === currentFolderId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dropping on a folder
    const targetFolder = folders.find((f) => f.id === over.id);
    if (targetFolder && active.id !== over.id) {
      // Move project to folder
      await moveProjectToFolder(active.id as string, targetFolder.id);
      return;
    }

    // Reordering within the same folder
    if (active.id !== over.id) {
      const oldIndex = filteredProjects.findIndex((p) => p.id === active.id);
      const newIndex = filteredProjects.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(filteredProjects, oldIndex, newIndex);
        const updates = newOrder.map((project, index) => ({
          id: project.id,
          displayOrder: index,
        }));
        await reorderProjects(updates);
      }
    }
  };

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
  const activeProject = filteredProjects.find((p) => p.id === activeId);

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
            <SortableContext
              items={filteredProjects.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <SortableProjectCard
                    key={project.id}
                    project={project}
                    onDelete={deleteProject}
                    onMove={moveProjectToFolder}
                    onRename={renameProject}
                  />
                ))}
              </div>
            </SortableContext>
          </>
        )}

        <DragOverlay>
          {activeProject ? (
            <div className="opacity-80">
              <ProjectCard project={activeProject} onDelete={async () => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
