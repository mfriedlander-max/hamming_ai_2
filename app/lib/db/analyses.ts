import { nanoid } from "nanoid";
import { db } from "./client";
import type { Analysis, FailureCategory } from "@/types";
import { createAuditEntry } from "./auditLog";

export async function createAnalysis(data: {
  projectId: string;
  testBatchId: string;
  systemPrompt: string;
  categories: FailureCategory[];
  metadata: {
    modelUsed: string;
    tokensUsed?: number;
    durationMs: number;
  };
  rawClaudeResponse?: string;
}): Promise<Analysis> {
  const analysis: Analysis = {
    id: nanoid(),
    projectId: data.projectId,
    testBatchId: data.testBatchId,
    systemPrompt: data.systemPrompt,
    analyzedAt: Date.now(),
    categories: data.categories,
    metadata: data.metadata,
    rawClaudeResponse: data.rawClaudeResponse,
  };

  await db.analyses.add(analysis);

  await createAuditEntry({
    projectId: data.projectId,
    action: "uploaded_prompt",
    actor: "user",
    details: {
      promptLength: data.systemPrompt.length,
    },
    relatedEntities: {
      analysisId: analysis.id,
    },
  });

  await createAuditEntry({
    projectId: data.projectId,
    action: "analyzed",
    actor: "system",
    details: {
      categoryCount: data.categories.length,
      modelUsed: data.metadata.modelUsed,
    },
    relatedEntities: {
      analysisId: analysis.id,
    },
  });
  return analysis;
}

export async function getAnalysis(id: string): Promise<Analysis | undefined> {
  return await db.analyses.get(id);
}

export async function getAnalysesByProject(
  projectId: string
): Promise<Analysis[]> {
  return await db.analyses
    .where("projectId")
    .equals(projectId)
    .reverse()
    .toArray();
}

export async function getLatestAnalysis(
  projectId: string
): Promise<Analysis | undefined> {
  const analyses = await getAnalysesByProject(projectId);
  return analyses[0];
}
