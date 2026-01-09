"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectCard } from "./ProjectCard";
import { GripVertical } from "lucide-react";
import type { Project } from "@/types";
import type { ProjectStatus } from "@/lib/db/projects";

interface SortableProjectCardProps {
  project: Project & { projectStatus: ProjectStatus };
  onDelete: (id: string) => Promise<void>;
  onMove?: (id: string, folderId: string) => Promise<void>;
  onRename?: (id: string, newName: string) => Promise<void>;
}

export function SortableProjectCard({ project, onDelete, onMove, onRename }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing z-10"
        title="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="pl-8">
        <ProjectCard project={project} onDelete={onDelete} onMove={onMove} onRename={onRename} />
      </div>
    </div>
  );
}
