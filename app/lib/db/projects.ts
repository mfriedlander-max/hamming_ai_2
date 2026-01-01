import { nanoid } from "nanoid";
import { db } from "./client";
import { createAuditEntry } from "./auditLog";
import type { Project } from "@/types";

export async function createProject(data: {
  name: string;
  description?: string;
  tags?: string[];
}): Promise<Project> {
  const now = Date.now();
  const project: Project = {
    id: nanoid(),
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
    currentPromptVersion: "",
    tags: data.tags,
  };

  await db.projects.add(project);
  await createAuditEntry({
    projectId: project.id,
    action: "created_project",
    actor: "user",
    details: {
      projectName: project.name,
    },
  });
  return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
  return await db.projects.get(id);
}

export async function getAllProjects(): Promise<Project[]> {
  return await db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<void> {
  await db.projects.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}
