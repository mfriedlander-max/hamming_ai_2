"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Suggestion } from "@/types";

type SuggestionStatus = "pending" | "accepted" | "rejected" | "applied" | "rejected_applied" | "reverted_applied" | "reverted_rejected";

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
  // Only add new entries - preserve existing draft state to avoid race conditions
  // This allows local changes to any status (including un-applying)
  useEffect(() => {
    setDraftStatus((prev) => {
      const updated = { ...prev };
      suggestions.forEach((s) => {
        // Only initialize if not already in draft state
        // This preserves user's local changes (including un-applying)
        if (!(s.id in updated)) {
          updated[s.id] = s.status;
        }
      });
      return updated;
    });
  }, [suggestions]);

  // Toggle between accepted and pending status
  // Does not work on applied suggestions - they are immutable
  const toggleAccept = useCallback((id: string) => {
    setDraftStatus((prev) => {
      // Don't toggle if already applied
      if (prev[id] === "applied") return prev;
      return {
        ...prev,
        [id]: prev[id] === "accepted" ? "pending" : "accepted",
      };
    });
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

  // Get the original status from the database (before any local changes)
  const getOriginalStatus = useCallback(
    (id: string): SuggestionStatus | undefined => {
      const suggestion = suggestions.find((s) => s.id === id);
      return suggestion?.status;
    },
    [suggestions]
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

  const appliedCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "applied").length,
    [draftSuggestions]
  );

  const rejectedAppliedCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "rejected_applied").length,
    [draftSuggestions]
  );

  const revertedAppliedCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "reverted_applied").length,
    [draftSuggestions]
  );

  const revertedRejectedCount = useMemo(
    () => draftSuggestions.filter((s) => s.status === "reverted_rejected").length,
    [draftSuggestions]
  );

  // Count of applyable suggestions - used for Apply button gating
  // Includes: accepted, rejected, reverted_applied, reverted_rejected
  const applyableCount = useMemo(
    () => acceptedCount + rejectedCount + revertedAppliedCount + revertedRejectedCount,
    [acceptedCount, rejectedCount, revertedAppliedCount, revertedRejectedCount]
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
    getOriginalStatus,
    acceptedCount,
    pendingCount,
    rejectedCount,
    appliedCount,
    rejectedAppliedCount,
    revertedAppliedCount,
    revertedRejectedCount,
    applyableCount,
    hasUnsavedChanges,
  };
}
