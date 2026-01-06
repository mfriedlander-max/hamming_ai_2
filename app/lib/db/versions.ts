import { nanoid } from "nanoid";
import { db } from "./client";
import { createAuditEntry } from "./auditLog";
import type { PromptVersion } from "@/types";

export async function createVersion(data: {
  projectId: string;
  content: string;
  createdBy: "user" | "system";
  changedFrom?: string;
  appliedSuggestions?: string[];
  changesSummary?: string;
  analysisId?: string;
}): Promise<PromptVersion> {
  const existingVersions = await getVersionsByProject(data.projectId);
  // V0-based versioning: first version is 0, subsequent versions are 1, 2, 3...
  const versionNumber = existingVersions.length;

  const version: PromptVersion = {
    id: nanoid(),
    projectId: data.projectId,
    versionNumber,
    content: data.content,
    createdAt: Date.now(),
    createdBy: data.createdBy,
    changedFrom: data.changedFrom,
    appliedSuggestions: data.appliedSuggestions,
    changesSummary: data.changesSummary,
    analysisId: data.analysisId,
  };

  await db.versions.add(version);

  await createAuditEntry({
    projectId: data.projectId,
    action: "created_version",
    actor: data.createdBy,
    details: {
      versionNumber,
      changesSummary: data.changesSummary || "New version created",
      appliedSuggestionsCount: data.appliedSuggestions?.length || 0,
    },
    relatedEntities: {
      versionId: version.id,
      analysisId: data.analysisId,
    },
  });
  return version;
}

export async function getVersion(id: string): Promise<PromptVersion | undefined> {
  return await db.versions.get(id);
}

export async function getVersionsByProject(
  projectId: string
): Promise<PromptVersion[]> {
  return await db.versions
    .where("projectId")
    .equals(projectId)
    .sortBy("versionNumber");
}

export async function getLatestVersion(
  projectId: string
): Promise<PromptVersion | undefined> {
  const versions = await getVersionsByProject(projectId);
  return versions[versions.length - 1];
}
