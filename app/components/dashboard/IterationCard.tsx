"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
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
import { MoreVertical, Trash2, ExternalLink, Pencil, History } from "lucide-react";
import type { Project } from "@/types";
import type { ProjectStatus } from "@/lib/db/projects";
import { cn } from "@/lib/utils";

interface IterationCardProps {
  project: Project & { projectStatus: ProjectStatus };
  previousPassRate?: number;
  onDelete: (id: string) => Promise<void>;
  onRename?: (id: string, newName: string) => Promise<void>;
  isTourTarget?: boolean;
}

function getDeltaDisplay(
  currentPassRate: number | undefined,
  previousPassRate: number | undefined
): { text: string; colorClass: string } {
  if (currentPassRate === undefined) {
    return { text: "—", colorClass: "text-gray-400" };
  }
  if (previousPassRate === undefined) {
    return { text: "—", colorClass: "text-gray-400" };
  }

  const delta = currentPassRate - previousPassRate;
  if (delta > 0) {
    return { text: `+${delta}%`, colorClass: "text-green-600" };
  } else if (delta < 0) {
    return { text: `${delta}%`, colorClass: "text-red-600" };
  } else {
    return { text: "0%", colorClass: "text-gray-500" };
  }
}

export function IterationCard({
  project,
  previousPassRate,
  onDelete,
  onRename,
  isTourTarget = false,
}: IterationCardProps) {
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

  const passRate = project.projectStatus.passRate;
  const delta = getDeltaDisplay(passRate, previousPassRate);

  return (
    <>
      <Card className="transition-smooth p-6 hover:shadow-md" data-tour="iteration-card">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}/editor`} className={cn("flex-1 block", isTourTarget && "pointer-events-none")}>
            {/* Top row: Name and Pass Rate */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              <span className={cn(
                "text-2xl font-bold",
                passRate !== undefined ? "text-gray-900" : "text-gray-400"
              )}>
                {passRate !== undefined ? `${passRate}%` : "—"}
              </span>
            </div>

            {/* Bottom row: Date and Delta */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(project.createdAt, { addSuffix: true })}
              </p>
              <span className={cn("text-sm font-medium", delta.colorClass)}>
                {delta.text}
              </span>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Iteration options</span>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Iteration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        projectName={project.name}
        onConfirm={handleDelete}
        title={`Delete ${project.name}`}
      />

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Iteration</DialogTitle>
            <DialogDescription>
              Enter a new name for this iteration.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Iteration name"
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
