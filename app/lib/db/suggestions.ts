import { nanoid } from "nanoid";
import { db } from "./client";
import { createAuditEntry } from "./auditLog";
import type { Suggestion, EvidenceSnippet } from "@/types";
import { generateDiff } from "@/lib/diff/generator";

export async function createSuggestion(data: {
  analysisId: string;
  categoryId: string;
  type: "add" | "remove" | "replace";
  targetSection?: string;
  originalText?: string;
  proposedText: string;
  reason: string;
  linkedTestIds: string[];
  evidence: EvidenceSnippet[];
  originalPrompt: string;
}): Promise<Suggestion> {
  const modifiedPrompt =
    data.type === "replace" && data.originalText
      ? data.originalPrompt.replace(data.originalText, data.proposedText)
      : data.type === "add"
      ? data.originalPrompt + "\n\n" + data.proposedText
      : data.originalPrompt;

  const diffInfo = generateDiff(data.originalPrompt, modifiedPrompt);

  const suggestion: Suggestion = {
    id: nanoid(),
    analysisId: data.analysisId,
    categoryId: data.categoryId,
    type: data.type,
    targetSection: data.targetSection,
    originalText: data.originalText,
    proposedText: data.proposedText,
    reason: data.reason,
    linkedTestIds: data.linkedTestIds,
    evidence: data.evidence,
    status: "pending",
    diffPatch: diffInfo.patch,
  };

  await db.suggestions.add(suggestion);
  return suggestion;
}

export async function getSuggestion(
  id: string
): Promise<Suggestion | undefined> {
  return await db.suggestions.get(id);
}

export async function getSuggestionsByAnalysis(
  analysisId: string
): Promise<Suggestion[]> {
  return await db.suggestions.where("analysisId").equals(analysisId).toArray();
}

export async function getSuggestionsByCategory(
  categoryId: string
): Promise<Suggestion[]> {
  return await db.suggestions.where("categoryId").equals(categoryId).toArray();
}

export async function updateSuggestionStatus(
  id: string,
  status: "pending" | "accepted" | "rejected",
  reviewNotes?: string
): Promise<void> {
  await db.suggestions.update(id, {
    status,
    reviewedAt: Date.now(),
    reviewNotes,
  });

  if (status === "accepted" || status === "rejected") {
    const suggestion = await db.suggestions.get(id);
    if (!suggestion) return;

    const analysis = await db.analyses.get(suggestion.analysisId);
    if (!analysis) return;

    await createAuditEntry({
      projectId: analysis.projectId,
      action: status === "accepted" ? "accepted_suggestion" : "rejected_suggestion",
      actor: "user",
      details: {
        suggestionId: suggestion.id,
        categoryId: suggestion.categoryId,
      },
      relatedEntities: {
        analysisId: analysis.id,
        suggestionId: suggestion.id,
      },
    });
  }
}
