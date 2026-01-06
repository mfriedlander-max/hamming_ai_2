"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types";
import {
  getAllProjects,
  getAllProjectsWithStatus,
  createProject as dbCreateProject,
  deleteProject as dbDeleteProject,
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
    await dbDeleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectsWithStatus((prev) => prev.filter((p) => p.id !== id));
  };

  const refresh = loadProjects;

  return { projects, projectsWithStatus, loading, createProject, deleteProject, refresh };
}
