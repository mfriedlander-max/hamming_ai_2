"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types";
import {
  getAllProjects,
  createProject as dbCreateProject,
  deleteProject as dbDeleteProject,
} from "@/lib/db/projects";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (data: { name: string; description?: string }) => {
    const project = await dbCreateProject(data);
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const deleteProject = async (id: string) => {
    await dbDeleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const refresh = loadProjects;

  return { projects, loading, createProject, deleteProject, refresh };
}
