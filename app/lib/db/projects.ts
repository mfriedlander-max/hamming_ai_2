import { nanoid } from "nanoid";
import { db } from "./client";
import { createAuditEntry } from "./auditLog";
import type { Project } from "@/types";

export class DuplicateProjectNameError extends Error {
  suggestedName: string;

  constructor(name: string, suggestedName: string) {
    super(`A project with the name "${name}" already exists.`);
    this.name = "DuplicateProjectNameError";
    this.suggestedName = suggestedName;
  }
}

export async function checkProjectNameExists(name: string): Promise<boolean> {
  const allProjects = await db.projects.toArray();
  return allProjects.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
}

export async function generateUniqueProjectName(baseName: string): Promise<string> {
  const allProjects = await db.projects.toArray();
  const existingNames = new Set(allProjects.map((p) => p.name.toLowerCase()));

  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  let counter = 2;
  let suggestedName = `${baseName} (${counter})`;
  while (existingNames.has(suggestedName.toLowerCase())) {
    counter++;
    suggestedName = `${baseName} (${counter})`;
  }
  return suggestedName;
}

export async function createProject(data: {
  name: string;
  description?: string;
  tags?: string[];
  systemPrompt?: string;
}): Promise<Project> {
  // Check for duplicate project name
  const nameExists = await checkProjectNameExists(data.name);
  if (nameExists) {
    const suggestedName = await generateUniqueProjectName(data.name);
    throw new DuplicateProjectNameError(data.name, suggestedName);
  }

  const now = Date.now();
  const project: Project = {
    id: nanoid(),
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
    currentPromptVersion: "",
    tags: data.tags,
    systemPrompt: data.systemPrompt,
  };

  await db.projects.add(project);
  await createAuditEntry({
    projectId: project.id,
    action: "created_project",
    actor: "user",
    details: {
      projectName: project.name,
      hasSystemPrompt: !!data.systemPrompt,
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

export interface ProjectStatus {
  status: "needs-analysis" | "pending-suggestions" | "up-to-date";
  label: string;
  pendingCount?: number;
  passRate?: number;
}

export async function getProjectStatus(projectId: string): Promise<ProjectStatus> {
  // Get latest analysis for this project
  const analyses = await db.analyses
    .where("projectId")
    .equals(projectId)
    .reverse()
    .toArray();

  const latestAnalysis = analyses[0];

  if (!latestAnalysis) {
    return {
      status: "needs-analysis",
      label: "Needs Analysis",
    };
  }

  // Get suggestions for this analysis
  const suggestions = await db.suggestions
    .where("analysisId")
    .equals(latestAnalysis.id)
    .toArray();

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  // Calculate pass rate from test batch if available
  let passRate: number | undefined;
  if (latestAnalysis.testBatchId) {
    const testBatch = await db.testBatches.get(latestAnalysis.testBatchId);
    if (testBatch && testBatch.tests.length > 0) {
      const passedTests = testBatch.tests.filter((t) => t.status === "pass").length;
      passRate = Math.round((passedTests / testBatch.tests.length) * 100);
    }
  }

  if (pendingSuggestions.length > 0) {
    return {
      status: "pending-suggestions",
      label: `${pendingSuggestions.length} Suggestion${pendingSuggestions.length === 1 ? "" : "s"} Pending`,
      pendingCount: pendingSuggestions.length,
      passRate,
    };
  }

  return {
    status: "up-to-date",
    label: "Up to Date",
    passRate,
  };
}

export async function getAllProjectsWithStatus(): Promise<
  Array<Project & { projectStatus: ProjectStatus }>
> {
  const projects = await db.projects.orderBy("updatedAt").reverse().toArray();
  const projectsWithStatus = await Promise.all(
    projects.map(async (project) => {
      const projectStatus = await getProjectStatus(project.id);
      return { ...project, projectStatus };
    })
  );
  return projectsWithStatus;
}
