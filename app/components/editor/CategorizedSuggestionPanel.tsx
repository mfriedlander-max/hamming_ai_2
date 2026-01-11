"use client";

import { useMemo, useState, useCallback } from "react";
import { CategoryAccordion } from "./CategoryAccordion";
import { Card } from "@/components/ui/card";
import { useWalkthrough } from "@/components/walkthrough/WalkthroughProvider";
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
  // Walkthrough context
  const { isActive: isWalkthroughActive, currentStepTarget } = useWalkthrough();

  // Track expanded state for each category
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Handle expand/collapse changes from CategoryAccordion
  const handleExpandChange = useCallback((categoryId: string, isExpanded: boolean) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(categoryId);
      } else {
        next.delete(categoryId);
      }
      return next;
    });
  }, []);

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

  // Determine tour targets based on walkthrough step
  const tourTargets = useMemo(() => {
    if (!isWalkthroughActive) {
      return { targetCategoryId: null, targetSuggestionId: null, categoryWithTargetSuggestion: null };
    }

    // For failure-category step: find first collapsed category
    if (currentStepTarget === "failure-category") {
      for (const cat of categoriesWithSuggestions) {
        if (!expandedCategories.has(cat.id)) {
          return { targetCategoryId: cat.id, targetSuggestionId: null, categoryWithTargetSuggestion: null };
        }
      }
      // All expanded - skip to first category (it will become the suggestion target)
      return { targetCategoryId: null, targetSuggestionId: null, categoryWithTargetSuggestion: null };
    }

    // For suggestion-action step: find first pending suggestion
    if (currentStepTarget === "suggestion-action" || currentStepTarget === "suggestion-card") {
      for (const cat of categoriesWithSuggestions) {
        const catSuggestions = suggestionsByCategory.get(cat.id) || [];
        const firstPending = catSuggestions.find(s => s.status === "pending");
        if (firstPending) {
          return {
            targetCategoryId: null,
            targetSuggestionId: firstPending.id,
            categoryWithTargetSuggestion: cat.id
          };
        }
      }
      // No pending suggestions - fallback to first suggestion in first expanded category
      for (const cat of categoriesWithSuggestions) {
        const catSuggestions = suggestionsByCategory.get(cat.id) || [];
        if (catSuggestions.length > 0 && expandedCategories.has(cat.id)) {
          return {
            targetCategoryId: null,
            targetSuggestionId: catSuggestions[0].id,
            categoryWithTargetSuggestion: cat.id
          };
        }
      }
    }

    return { targetCategoryId: null, targetSuggestionId: null, categoryWithTargetSuggestion: null };
  }, [isWalkthroughActive, currentStepTarget, categoriesWithSuggestions, expandedCategories, suggestionsByCategory]);

  // Determine if tour is active and in a relevant step
  const isTourActiveForCategories = isWalkthroughActive && (
    currentStepTarget === "suggestions-panel" ||
    currentStepTarget === "failure-category" ||
    currentStepTarget === "suggestion-action" ||
    currentStepTarget === "suggestion-card"
  );

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
          {categoriesWithSuggestions.map((category, index) => {
            const isExpanded = expandedCategories.has(category.id);
            const catSuggestions = suggestionsByCategory.get(category.id) || [];

            // Find first pending suggestion in this category
            const firstPendingInCategory = catSuggestions.find(s => s.status === "pending");

            return (
              <CategoryAccordion
                key={category.id}
                category={category}
                suggestions={catSuggestions}
                onToggleAccept={onToggleAccept}
                onSetStatus={onSetStatus}
                isDraftModified={isDraftModified}
                getOriginalStatus={getOriginalStatus}
                defaultExpanded={isExpanded}
                onExpandChange={handleExpandChange}
                isFirstCategory={index === 0}
                // Tour props
                isTourActive={isTourActiveForCategories}
                isTourTargetCategory={tourTargets.targetCategoryId === category.id}
                isTourTargetSuggestion={tourTargets.categoryWithTargetSuggestion === category.id}
                firstPendingSuggestionId={
                  tourTargets.categoryWithTargetSuggestion === category.id
                    ? tourTargets.targetSuggestionId
                    : firstPendingInCategory?.id ?? null
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
