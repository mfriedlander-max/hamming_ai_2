"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { FolderWithCount } from "@/lib/hooks/useFolders";
import { DEFAULT_FOLDER_ID } from "@/types/folder";

interface FolderCardProps {
  folder: FolderWithCount;
  onNavigate: (id: string) => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function FolderCard({
  folder,
  onNavigate,
  onRename,
  onDelete,
}: FolderCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);

  const isDefaultFolder = folder.id === DEFAULT_FOLDER_ID;

  const handleRename = async () => {
    if (!newName.trim() || newName === folder.name) {
      setIsRenaming(false);
      return;
    }
    setIsLoading(true);
    try {
      await onRename(folder.id, newName.trim());
      setIsRenaming(false);
    } catch (error) {
      console.error("Failed to rename folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(folder.id);
      setIsDeleting(false);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    onNavigate(folder.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate(folder.id);
    }
  };

  return (
    <>
      <Card
        className="transition-smooth p-6 hover:shadow-md cursor-pointer group"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open folder ${folder.name}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {folder.name}
              </h3>
              <p className="text-sm text-gray-500">
                {folder.projectCount} {folder.projectCount === 1 ? "project" : "projects"}
              </p>
            </div>
          </div>
          {!isDefaultFolder && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Folder options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewName(folder.name);
                    setIsRenaming(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleting(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name"
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
              onClick={() => setIsRenaming(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isLoading || !newName.trim()}>
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{folder.name}&quot;?
              {folder.projectCount > 0 && (
                <>
                  {" "}
                  The {folder.projectCount}{" "}
                  {folder.projectCount === 1 ? "project" : "projects"} in this
                  folder will be moved to My Projects.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleting(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
