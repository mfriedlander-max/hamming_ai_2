import type { Suggestion } from "@/types";

export interface ApplyResult {
  success: boolean;
  updatedPrompt: string;
  appliedSuggestions: string[];
  conflicts?: Array<{
    suggestionId: string;
    reason: string;
  }>;
}

export function applyAcceptedSuggestions(
  originalPrompt: string,
  suggestions: Suggestion[]
): ApplyResult {
  const acceptedSuggestions = suggestions.filter((s) => s.status === "accepted");

  if (acceptedSuggestions.length === 0) {
    return {
      success: false,
      updatedPrompt: originalPrompt,
      appliedSuggestions: [],
    };
  }

  const conflicts = detectConflicts(acceptedSuggestions);

  if (conflicts.length > 0) {
    return {
      success: false,
      updatedPrompt: originalPrompt,
      appliedSuggestions: [],
      conflicts,
    };
  }

  let updatedPrompt = originalPrompt;
  const appliedIds: string[] = [];

  for (const suggestion of acceptedSuggestions) {
    try {
      updatedPrompt = applySingleSuggestion(updatedPrompt, suggestion);
      appliedIds.push(suggestion.id);
    } catch (error) {
      console.error("Failed to apply suggestion:", suggestion.id, error);
    }
  }

  return {
    success: true,
    updatedPrompt,
    appliedSuggestions: appliedIds,
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
