"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IterationCard } from "./IterationCard";
import { GripVertical } from "lucide-react";
import type { Project } from "@/types";
import type { ProjectStatus } from "@/lib/db/projects";

interface SortableIterationCardProps {
  project: Project & { projectStatus: ProjectStatus };
  previousPassRate?: number;
  onDelete: (id: string) => Promise<void>;
  onRename?: (id: string, newName: string) => Promise<void>;
}

export function SortableIterationCard({
  project,
  previousPassRate,
  onDelete,
  onRename,
}: SortableIterationCardProps) {
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
        <IterationCard
          project={project}
          previousPassRate={previousPassRate}
          onDelete={onDelete}
          onRename={onRename}
        />
      </div>
    </div>
  );
}
