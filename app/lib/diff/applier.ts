import type { Suggestion } from "@/types";

export interface ApplyResult {
  success: boolean;
  updatedPrompt: string;
  appliedSuggestions: string[];  // IDs of accepted suggestions that were applied
  rejectedSuggestions: string[]; // IDs of rejected suggestions that were applied
  conflicts?: Array<{
    suggestionId: string;
    reason: string;
  }>;
}

export function applyAcceptedSuggestions(
  originalPrompt: string,
  suggestions: Suggestion[],
  options?: { includeApplied?: boolean }
): ApplyResult {
  // By default, apply "accepted" AND "rejected" suggestions (for creating new versions)
  // When includeApplied is true, also include "applied" and "rejected_applied" (for preview)
  const includeApplied = options?.includeApplied ?? false;

  const suggestionsToApply = suggestions.filter((s) =>
    s.status === "accepted" ||
    s.status === "rejected" ||
    s.status === "reverted_applied" ||
    s.status === "reverted_rejected" ||
    (includeApplied && (s.status === "applied" || s.status === "rejected_applied"))
  );

  if (suggestionsToApply.length === 0) {
    return {
      success: false,
      updatedPrompt: originalPrompt,
      appliedSuggestions: [],
      rejectedSuggestions: [],
    };
  }

  const conflicts = detectConflicts(suggestionsToApply);

  if (conflicts.length > 0) {
    return {
      success: false,
      updatedPrompt: originalPrompt,
      appliedSuggestions: [],
      rejectedSuggestions: [],
      conflicts,
    };
  }

  let updatedPrompt = originalPrompt;
  const appliedIds: string[] = [];
  const rejectedIds: string[] = [];

  for (const suggestion of suggestionsToApply) {
    try {
      updatedPrompt = applySingleSuggestion(updatedPrompt, suggestion);
      // Track which go to "applied" vs "rejected_applied"
      // reverted_applied -> applied, reverted_rejected -> rejected_applied
      if (suggestion.status === "accepted" || suggestion.status === "applied" || suggestion.status === "reverted_applied") {
        appliedIds.push(suggestion.id);
      } else if (suggestion.status === "rejected" || suggestion.status === "rejected_applied" || suggestion.status === "reverted_rejected") {
        rejectedIds.push(suggestion.id);
      }
    } catch (error) {
      console.error("Failed to apply suggestion:", suggestion.id, error);
    }
  }

  return {
    success: true,
    updatedPrompt,
    appliedSuggestions: appliedIds,
    rejectedSuggestions: rejectedIds,
  };
}

function applySingleSuggestion(prompt: string, suggestion: Suggestion): string {
  switch (suggestion.type) {
    case "replace":
      if (!suggestion.originalText) {
        throw new Error("Original text required for replace");
      }
      if (!prompt.includes(suggestion.originalText)) {
        throw new Error("Original text not found in prompt");
      }
      return prompt.replace(suggestion.originalText, suggestion.proposedText);

    case "remove":
      if (!suggestion.originalText) {
        throw new Error("Original text required for remove");
      }
      return prompt.replace(suggestion.originalText, "");

    case "add":
      return prompt.trim() + "\n\n" + suggestion.proposedText;

    default:
      throw new Error(`Unknown suggestion type: ${suggestion.type}`);
  }
}

function detectConflicts(
  suggestions: Suggestion[]
): Array<{ suggestionId: string; reason: string }> {
  const conflicts: Array<{ suggestionId: string; reason: string }> = [];
  const originalTexts = new Map<string, string[]>();

  for (const suggestion of suggestions) {
    if (suggestion.originalText) {
      const existing = originalTexts.get(suggestion.originalText) || [];
      existing.push(suggestion.id);
      originalTexts.set(suggestion.originalText, existing);
    }
  }

  for (const [text, ids] of originalTexts.entries()) {
    if (ids.length > 1) {
      ids.forEach((id) => {
        conflicts.push({
          suggestionId: id,
          reason: `Multiple suggestions modify: "${text.substring(0, 50)}..."`,
        });
      });
    }
  }

  return conflicts;
}
