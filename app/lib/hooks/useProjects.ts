"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types";
import {
  getAllProjects,
  getAllProjectsWithStatus,
  createProject as dbCreateProject,
  deleteProjectWithRelated,
  moveProjectToFolder as dbMoveProjectToFolder,
  reorderProjects as dbReorderProjects,
  renameProject as dbRenameProject,
  type ProjectStatus,
} from "@/lib/db/projects";

export type ProjectWithStatus = Project & { projectStatus: ProjectStatus };

export function useProjects(options?: { includeStatus?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsWithStatus, setProjectsWithStatus] = useState<ProjectWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (options?.includeStatus) {
        const data = await getAllProjectsWithStatus();
        setProjectsWithStatus(data);
        setProjects(data);
      } else {
        const data = await getAllProjects();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [options?.includeStatus]);

  const createProject = async (data: { name: string; description?: string }) => {
    const project = await dbCreateProject(data);
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const deleteProject = async (id: string) => {
    await deleteProjectWithRelated(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectsWithStatus((prev) => prev.filter((p) => p.id !== id));
  };

  const moveProjectToFolder = async (projectId: string, targetFolderId: string) => {
    await dbMoveProjectToFolder(projectId, targetFolderId);
    // Update local state
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, folderId: targetFolderId } : p))
    );
    setProjectsWithStatus((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, folderId: targetFolderId } : p))
    );
  };

  const reorderProjects = async (updates: Array<{ id: string; displayOrder: number }>) => {
    await dbReorderProjects(updates);
    // Update local state
    const orderMap = new Map(updates.map((u) => [u.id, u.displayOrder]));
    setProjects((prev) =>
      prev.map((p) => {
        const newOrder = orderMap.get(p.id);
        return newOrder !== undefined ? { ...p, displayOrder: newOrder } : p;
      })
    );
    setProjectsWithStatus((prev) =>
      prev.map((p) => {
        const newOrder = orderMap.get(p.id);
        return newOrder !== undefined ? { ...p, displayOrder: newOrder } : p;
      })
    );
  };

  const renameProject = async (id: string, newName: string) => {
    await dbRenameProject(id, newName);
    const now = Date.now();
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName, updatedAt: now } : p))
    );
    setProjectsWithStatus((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName, updatedAt: now } : p))
    );
  };

  const refresh = loadProjects;

  return {
    projects,
    projectsWithStatus,
    loading,
    createProject,
    deleteProject,
    moveProjectToFolder,
    reorderProjects,
    renameProject,
    refresh,
  };
}
