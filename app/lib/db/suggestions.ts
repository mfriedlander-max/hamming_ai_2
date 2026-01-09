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
  // Enforce test-grounded suggestions - every suggestion must be linked to at least one test
  if (!data.linkedTestIds || data.linkedTestIds.length === 0) {
    throw new Error('Suggestions must be linked to at least one test');
  }

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
  status: "pending" | "accepted" | "rejected" | "applied" | "rejected_applied" | "reverted_applied" | "reverted_rejected",
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

export async function markSuggestionsAsApplied(
  suggestionIds: string[]
): Promise<void> {
  if (suggestionIds.length === 0) return;

  await db.transaction("rw", db.suggestions, async () => {
    const now = Date.now();
    for (const id of suggestionIds) {
      await db.suggestions.update(id, {
        status: "applied",
        reviewedAt: now,
      });
    }
  });
}

/**
 * Reset all suggestions for an analysis to "pending" status.
 * Used when rolling back to a version that has no acceptedSuggestionIds/rejectedSuggestionIds
 * (i.e., versions created before rollback state tracking was added).
 */
export async function resetSuggestionsForAnalysis(
  analysisId: string
): Promise<number> {
  const suggestions = await db.suggestions
    .where("analysisId")
    .equals(analysisId)
    .toArray();

  if (suggestions.length === 0) return 0;

  await db.transaction("rw", db.suggestions, async () => {
    for (const suggestion of suggestions) {
      await db.suggestions.update(suggestion.id, {
        status: "pending",
        reviewedAt: undefined,
        reviewNotes: undefined,
      });
    }
  });

  return suggestions.length;
}

/**
 * Restore suggestion states to match a specific version.
 * Used when rolling back to restore the exact state at that version.
 * - Suggestions in acceptedIds -> "applied"
 * - Suggestions in rejectedIds -> "rejected_applied"
 * - All other suggestions -> "pending"
 */
export async function restoreSuggestionStatesForVersion(
  analysisId: string,
  acceptedIds: string[],
  rejectedIds: string[]
): Promise<void> {
  const suggestions = await db.suggestions
    .where("analysisId")
    .equals(analysisId)
    .toArray();

  if (suggestions.length === 0) return;

  const acceptedSet = new Set(acceptedIds);
  const rejectedSet = new Set(rejectedIds);

  await db.transaction("rw", db.suggestions, async () => {
    for (const suggestion of suggestions) {
      let newStatus: "pending" | "applied" | "rejected_applied";
      if (acceptedSet.has(suggestion.id)) {
        newStatus = "applied";
      } else if (rejectedSet.has(suggestion.id)) {
        newStatus = "rejected_applied";
      } else {
        newStatus = "pending";
      }
      await db.suggestions.update(suggestion.id, {
        status: newStatus,
        reviewedAt: newStatus === "pending" ? undefined : Date.now(),
      });
    }
  });
}
