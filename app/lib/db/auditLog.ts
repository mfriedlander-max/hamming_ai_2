import { nanoid } from "nanoid";
import { db } from "./client";
import type { AuditEntry } from "@/types";

export async function createAuditEntry(data: {
  projectId: string;
  action:
    | "created_project"
    | "uploaded_prompt"
    | "analyzed"
    | "accepted_suggestion"
    | "rejected_suggestion"
    | "exported"
    | "created_version"
    | "rollback_version";
  actor: string;
  details: Record<string, any>;
  relatedEntities?: {
    versionId?: string;
    analysisId?: string;
    suggestionId?: string;
  };
}): Promise<AuditEntry> {
  const entry: AuditEntry = {
    id: nanoid(),
    projectId: data.projectId,
    timestamp: Date.now(),
    action: data.action,
    actor: data.actor,
    details: data.details,
    relatedEntities: data.relatedEntities || {},
  };

  await db.auditLog.add(entry);
  return entry;
}

export async function getAuditLog(projectId: string): Promise<AuditEntry[]> {
  return await db.auditLog
    .where("projectId")
    .equals(projectId)
    .reverse()
    .sortBy("timestamp");
}

export async function getAuditEntriesByAction(
  projectId: string,
  action: AuditEntry["action"]
): Promise<AuditEntry[]> {
  const allEntries = await getAuditLog(projectId);
  return allEntries.filter((e) => e.action === action);
}
