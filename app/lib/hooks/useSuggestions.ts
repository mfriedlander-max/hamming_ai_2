"use client";

import { useState, useEffect } from "react";
import type { Suggestion, FailureCategory, TestResult } from "@/types";
import {
  getSuggestionsByAnalysis,
  createSuggestion,
  markSuggestionsAsApplied as dbMarkSuggestionsAsApplied,
} from "@/lib/db/suggestions";

export function useSuggestions(analysisId: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [analysisId]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSuggestionsByAnalysis(analysisId);
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateForCategory = async (
    systemPrompt: string,
    category: FailureCategory,
    allTests: TestResult[]
  ) => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_suggestions",
          payload: {
            systemPrompt,
            category,
            allTests,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate suggestions");
      }

      const { suggestions: suggestionData } = await response.json();

      const newSuggestions = await Promise.all(
        suggestionData.map((s: any) =>
          createSuggestion({
            analysisId,
            categoryId: category.id,
            type: s.type,
            targetSection: s.targetSection,
            originalText: s.originalText,
            proposedText: s.proposedText,
            reason: s.reason,
            linkedTestIds: s.linkedTestIds,
            evidence: category.evidence.filter((ev) =>
              s.linkedTestIds.includes(ev.testId)
            ),
            originalPrompt: systemPrompt,
          })
        )
      );

      setSuggestions((prev) => [...prev, ...newSuggestions]);
    } catch (err: any) {
      setError(err.message || "Failed to generate suggestions");
      console.error("Suggestion generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const markAsApplied = async (suggestionIds: string[]) => {
    await dbMarkSuggestionsAsApplied(suggestionIds);
    // Update local state to reflect applied status
    setSuggestions((prev) =>
      prev.map((s) =>
        suggestionIds.includes(s.id) ? { ...s, status: "applied" as const } : s
      )
    );
  };

  return {
    suggestions,
    loading,
    generating,
    error,
    generateForCategory,
    markAsApplied,
    refresh: loadSuggestions,
  };
}
