"use client";

import { useMemo } from "react";
import { CategoryAccordion } from "./CategoryAccordion";
import { Card } from "@/components/ui/card";
import type { Suggestion, FailureCategory } from "@/types";

type SuggestionStatus = "pending" | "accepted" | "rejected" | "applied" | "rejected_applied" | "reverted_applied" | "reverted_rejected";

interface CategorizedSuggestionPanelProps {
  categories: FailureCategory[];
  suggestions: Suggestion[];
  onToggleAccept: (id: string) => void;
  onSetStatus: (id: string, status: SuggestionStatus) => void;
  isDraftModified?: (id: string) => boolean;
  getOriginalStatus?: (id: string) => SuggestionStatus | undefined;
  acceptedCount: number;
  pendingCount: number;
  appliedCount: number;
  rejectedCount: number;
}

const severityOrder = { high: 0, medium: 1, low: 2 };

export function CategorizedSuggestionPanel({
  categories,
  suggestions,
  onToggleAccept,
  onSetStatus,
  isDraftModified,
  getOriginalStatus,
  acceptedCount,
  pendingCount,
  appliedCount,
  rejectedCount,
}: CategorizedSuggestionPanelProps) {
  // Group suggestions by category and sort categories by severity
  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );
  }, [categories]);

  const suggestionsByCategory = useMemo(() => {
    const map = new Map<string, Suggestion[]>();
    for (const suggestion of suggestions) {
      const existing = map.get(suggestion.categoryId) || [];
      existing.push(suggestion);
      map.set(suggestion.categoryId, existing);
    }
    return map;
  }, [suggestions]);

  // Filter to only show categories that have suggestions
  const categoriesWithSuggestions = useMemo(() => {
    return sortedCategories.filter(
      (cat) => (suggestionsByCategory.get(cat.id)?.length ?? 0) > 0
    );
  }, [sortedCategories, suggestionsByCategory]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-green-600">{acceptedCount} accepted</span>
          <span className="text-gray-600">{pendingCount} pending</span>
          <span className="text-blue-600">{appliedCount} applied</span>
          <span className="text-red-600">{rejectedCount} rejected</span>
        </div>
      </Card>
      <h3 className="text-lg font-semibold text-gray-900">
        Failure Categories ({categoriesWithSuggestions.length})
      </h3>

      {categoriesWithSuggestions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">No suggestions available</p>
          <p className="mt-1 text-sm text-gray-400">
            Suggestions will appear here after analysis
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoriesWithSuggestions.map((category) => (
            <CategoryAccordion
              key={category.id}
              category={category}
              suggestions={suggestionsByCategory.get(category.id) || []}
              onToggleAccept={onToggleAccept}
              onSetStatus={onSetStatus}
              isDraftModified={isDraftModified}
              getOriginalStatus={getOriginalStatus}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
