"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Suggestion } from "@/types";

type SuggestionStatus = "pending" | "accepted" | "rejected";

/**
 * Hook to manage draft suggestion states locally without modifying the database.
 *
 * This enables reversible accept/reject operations:
 * - Suggestions in DB remain immutable
 * - Toggle operates on LOCAL DRAFT state only
 * - "Apply Changes" creates a NEW version snapshot
 * - Prior versions are NEVER modified
 * - Version history is append-only
 */
export function useDraftSuggestions(suggestions: Suggestion[]) {
  // Local draft state - maps suggestionId -> draft status
  const [draftStatus, setDraftStatus] = useState<Record<string, SuggestionStatus>>({});

  // Initialize from DB suggestions when they change
  useEffect(() => {
    const initial: Record<string, SuggestionStatus> = {};
    suggestions.forEach((s) => {
      initial[s.id] = s.status;
    });
    setDraftStatus(initial);
  }, [suggestions]);

  // Toggle between accepted and pending status
  const toggleAccept = useCallback((id: string) => {
    setDraftStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "accepted" ? "pending" : "accepted",
    }));
  }, []);

  // Set a specific status for a suggestion
  const setStatus = useCallback((id: string, status: SuggestionStatus) => {
    setDraftStatus((prev) => ({ ...prev, [id]: status }));
  }, []);

  // Reset draft state to match DB state
  const resetDraft = useCallback(() => {
    const initial: Record<string, SuggestionStatus> = {};
    suggestions.forEach((s) => {
      initial[s.id] = s.status;
    });
    setDraftStatus(initial);
  }, [suggestions]);

  // Check if a specific suggestion has been modified from its DB state
  const isDraftModified = useCallback(
    (id: string) => {
      const suggestion = suggestions.find((s) => s.id === id);
      if (!suggestion) return false;
      return draftStatus[id] !== suggestion.status;
    },
    [suggestions, draftStatus]
  );

  // Returns suggestions with draft status applied (for preview)
  const draftSuggestions = useMemo(
    () =>
      suggestions.map((s) => ({
        ...s,
        status: draftStatus[s.id] || s.status,
      })),
    [suggestions, draftStatus]
  );

  const acceptedCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "accepted").length,
    [draftSuggestions]
  );

  const pendingCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "pending").length,
    [draftSuggestions]
  );

  const rejectedCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "rejected").length,
    [draftSuggestions]
  );

  // Check if any suggestions have been modified from DB state
  const hasUnsavedChanges = useMemo(
    () =>
      suggestions.some((s) => draftStatus[s.id] !== s.status),
    [suggestions, draftStatus]
  );

  return {
    draftSuggestions,
    draftStatus,
    toggleAccept,
    setStatus,
    resetDraft,
    isDraftModified,
    acceptedCount,
    pendingCount,
    rejectedCount,
    hasUnsavedChanges,
  };
}
