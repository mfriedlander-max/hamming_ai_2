"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { formatDistanceToNow } from "date-fns";
import { History, MoreVertical, Trash2, ExternalLink, Pencil, FolderOpen } from "lucide-react";
import type { Project } from "@/types";
import type { ProjectStatus } from "@/lib/db/projects";
import { DEFAULT_FOLDER_ID } from "@/types/folder";

interface ProjectCardProps {
  project: Project & { projectStatus: ProjectStatus };
  onDelete: (id: string) => Promise<void>;
  onMove?: (id: string, folderId: string) => Promise<void>;
  onRename?: (id: string, newName: string) => Promise<void>;
}

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

export function ProjectCard({ project, onDelete, onMove, onRename }: ProjectCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDelete = async () => {
    await onDelete(project.id);
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === project.name || !onRename) return;
    setIsRenaming(true);
    try {
      await onRename(project.id, newName.trim());
      setIsRenameOpen(false);
    } finally {
      setIsRenaming(false);
    }
  };

  const isInFolder = project.folderId && project.folderId !== DEFAULT_FOLDER_ID;

  return (
    <>
      <Card className="transition-smooth p-6 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}/editor`} className="flex-1 block">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Project options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}/editor`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Editor
                </Link>
              </DropdownMenuItem>
              {onRename && (
                <DropdownMenuItem
                  onClick={() => {
                    setNewName(project.name);
                    setIsRenameOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
              )}
              {project.projectStatus.hasVersions && (
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}/history`}>
                    <History className="mr-2 h-4 w-4" />
                    View History
                  </Link>
                </DropdownMenuItem>
              )}
              {isInFolder && onMove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onMove(project.id, DEFAULT_FOLDER_ID)}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Move to My Projects
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        projectName={project.name}
        onConfirm={handleDelete}
      />

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for this project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !newName.trim()}
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
