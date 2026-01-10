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
      // Check if this is a revert operation
      const isRevert = suggestion.status === "reverted_applied" ||
                       suggestion.status === "reverted_rejected";

      if (isRevert) {
        // For reverts, we need to UNDO the suggestion
        // Only revert text changes if it was previously accepted (reverted_applied)
        // reverted_rejected means they're un-rejecting, so no text change needed
        if (suggestion.status === "reverted_applied") {
          updatedPrompt = revertSingleSuggestion(updatedPrompt, suggestion);
        }
        // After applying revert, the suggestion goes back to pending
        // Track in appliedIds so handleApply knows to reset status
        appliedIds.push(suggestion.id);
      } else {
        // Original logic for accepting/rejecting
        // Only apply text changes for accepted suggestions, NOT rejected ones
        // Rejected suggestions only get their status tracked (-> rejected_applied)
        const isAccepted = suggestion.status === "accepted" ||
                           suggestion.status === "applied";

        if (isAccepted) {
          updatedPrompt = applySingleSuggestion(updatedPrompt, suggestion);
        }

        // Track which go to "applied" vs "rejected_applied"
        if (isAccepted) {
          appliedIds.push(suggestion.id);
        } else {
          rejectedIds.push(suggestion.id);
        }
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
      // Idempotency check: skip if text already exists in prompt
      if (prompt.includes(suggestion.proposedText)) {
        return prompt;
      }
      return prompt.trim() + "\n\n" + suggestion.proposedText;

    default:
      throw new Error(`Unknown suggestion type: ${suggestion.type}`);
  }
}

/**
 * Reverts a previously applied suggestion by undoing its text changes.
 * - For "add": removes the added text
 * - For "replace": replaces proposedText back to originalText
 * - For "remove": adds back the removed text (at end)
 */
function revertSingleSuggestion(prompt: string, suggestion: Suggestion): string {
  switch (suggestion.type) {
    case "add":
      // Remove the text that was added
      if (!prompt.includes(suggestion.proposedText)) {
        // Text not found - already reverted or never applied
        return prompt;
      }
      // Remove the proposed text and clean up extra newlines
      return prompt
        .replace(suggestion.proposedText, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    case "replace":
      // Replace back: proposedText -> originalText
      if (!suggestion.originalText) {
        throw new Error("Original text required for revert replace");
      }
      if (!prompt.includes(suggestion.proposedText)) {
        // proposedText not found - may have been further modified
        return prompt;
      }
      return prompt.replace(suggestion.proposedText, suggestion.originalText);

    case "remove":
      // Add back the removed text (at end, since we don't know original position)
      if (!suggestion.originalText) {
        throw new Error("Original text required for revert remove");
      }
      // Check if already present (idempotency)
      if (prompt.includes(suggestion.originalText)) {
        return prompt;
      }
      return prompt.trim() + "\n\n" + suggestion.originalText;

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
