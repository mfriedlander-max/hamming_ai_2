"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Circle, Undo2, CheckCircle2 } from "lucide-react";
import type { Suggestion, FailureCategory } from "@/types";

type SuggestionStatus = "pending" | "accepted" | "rejected" | "applied" | "rejected_applied" | "reverted_applied" | "reverted_rejected";

interface CategoryAccordionProps {
  category: FailureCategory;
  suggestions: Suggestion[];
  onToggleAccept: (id: string) => void;
  onSetStatus: (id: string, status: SuggestionStatus) => void;
  isDraftModified?: (id: string) => boolean;
  getOriginalStatus?: (id: string) => SuggestionStatus | undefined;
  defaultExpanded?: boolean;
  onExpandChange?: (categoryId: string, isExpanded: boolean) => void; // Callback when expanded state changes
  isFirstCategory?: boolean; // For walkthrough tour targeting
  // Tour state props
  isTourActive?: boolean; // Is walkthrough currently active
  isTourTargetCategory?: boolean; // Is this category the target for failure-category step
  isTourTargetSuggestion?: boolean; // Does this category contain the target suggestion
  firstPendingSuggestionId?: string | null; // ID of the first pending suggestion to target
}

const severityColors = {
  high: "border-l-red-500 bg-red-50/30",
  medium: "border-l-yellow-500 bg-yellow-50/30",
  low: "border-l-blue-500 bg-blue-50/30",
};

const severityBadgeColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export function CategoryAccordion({
  category,
  suggestions,
  onToggleAccept,
  onSetStatus,
  isDraftModified,
  getOriginalStatus,
  defaultExpanded = false,
  onExpandChange,
  isFirstCategory = false,
  isTourActive = false,
  isTourTargetCategory = false,
  isTourTargetSuggestion = false,
  firstPendingSuggestionId = null,
}: CategoryAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandChange?.(category.id, newExpanded);
  };

  const acceptedCount = suggestions.filter((s) => s.status === "accepted").length;
  const appliedCount = suggestions.filter((s) => s.status === "applied").length;
  const totalCount = suggestions.length;

  return (
    <div
      className={`rounded-lg border-l-4 transition-smooth ${severityColors[category.severity]}`}
    >
      <button
        onClick={handleToggleExpand}
        className={`flex w-full items-start justify-between p-4 text-left hover:bg-gray-50/50 ${
          isTourActive && !isTourTargetCategory ? "pointer-events-none" : ""
        }`}
        aria-expanded={isExpanded}
        {...(isTourTargetCategory ? { "data-tour": "failure-category" } : {})}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <span className="font-medium text-gray-900">{category.name}</span>
            <p className="mt-1 text-sm text-gray-600">
              {category.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <Badge className={severityBadgeColors[category.severity]}>
            {category.severity}
          </Badge>
          {appliedCount > 0 ? (
            <>
              <span className="text-blue-600" title="Applied">{appliedCount}</span>
              {acceptedCount > 0 && (
                <>
                  <span className="text-gray-400">+</span>
                  <span className="text-green-600" title="Accepted">{acceptedCount}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-green-600">{acceptedCount}</span>
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{totalCount}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 border-t border-gray-100 p-4">
          {suggestions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No suggestions for this category</p>
          ) : (
            suggestions.map((suggestion, index) => {
              // Target this suggestion if it's the first pending one in this category (for tour)
              const isTourTargetSuggestionCard = isTourTargetSuggestion && suggestion.id === firstPendingSuggestionId;
              const isModified = isDraftModified?.(suggestion.id) ?? false;
              const originalStatus = getOriginalStatus?.(suggestion.id);

              // Determine status badge based on state machine
              const getStatusBadge = () => {
                switch (suggestion.status) {
                  case "accepted":
                    return (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Draft
                      </Badge>
                    );
                  case "rejected":
                    return (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                        Reject
                      </Badge>
                    );
                  case "applied":
                    return (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Applied
                      </Badge>
                    );
                  case "rejected_applied":
                    return (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                        Rejected
                      </Badge>
                    );
                  case "reverted_applied":
                  case "reverted_rejected":
                    return (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                        Revert
                      </Badge>
                    );
                  case "pending":
                  default:
                    return null;
                }
              };

              // Determine status icon
              const getStatusIcon = () => {
                switch (suggestion.status) {
                  case "applied":
                    return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
                  case "accepted":
                    return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case "rejected":
                  case "rejected_applied":
                    return <XCircle className="h-4 w-4 text-red-600" />;
                  case "reverted_applied":
                  case "reverted_rejected":
                    return <Undo2 className="h-4 w-4 text-amber-600" />;
                  case "pending":
                  default:
                    return <Circle className="h-4 w-4 text-gray-400" />;
                }
              };

              return (
                <Card
                  key={suggestion.id}
                  className={`transition-smooth p-4 hover:shadow-sm ${
                    isModified ? "ring-2 ring-blue-200 ring-offset-1" : ""
                  }`}
                  {...(isTourTargetSuggestionCard ? { "data-tour": "suggestion-card" } : {})}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <Badge variant="outline">add</Badge>
                        {getStatusBadge()}
                      </div>
                      <p className="mt-2 text-sm text-gray-900">{suggestion.reason}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        {suggestion.linkedTestIds.length} test(s)
                      </p>
                    </div>

                    <div className="flex gap-2" data-tour="suggestion-actions">
                      {/* DECISION PHASE */}

                      {/* pending: Accept, Reject */}
                      {suggestion.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onSetStatus(suggestion.id, "accepted")}
                            {...(isTourTargetSuggestionCard ? { "data-tour": "suggestion-action" } : {})}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSetStatus(suggestion.id, "rejected")}
                            {...(isTourTargetSuggestionCard ? { "data-tour": "suggestion-action" } : {})}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {/* accepted: Unaccept */}
                      {suggestion.status === "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetStatus(suggestion.id, "pending")}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Unaccept
                        </Button>
                      )}

                      {/* rejected: Unreject */}
                      {suggestion.status === "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetStatus(suggestion.id, "pending")}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Unreject
                        </Button>
                      )}

                      {/* APPLIED PHASE */}

                      {/* applied: Unapply ONLY (no Reject) */}
                      {suggestion.status === "applied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetStatus(suggestion.id, "reverted_applied")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Unapply
                        </Button>
                      )}

                      {/* rejected_applied: Unreject */}
                      {suggestion.status === "rejected_applied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetStatus(suggestion.id, "reverted_rejected")}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Unreject
                        </Button>
                      )}

                      {/* REVERTED PHASE - no per-card buttons, handled by global Apply */}

                      {/* reverted_applied: Reapply button */}
                      {suggestion.status === "reverted_applied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetStatus(suggestion.id, "applied")}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Reapply
                        </Button>
                      )}

                      {/* reverted_rejected: Rereject button */}
                      {suggestion.status === "reverted_rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetStatus(suggestion.id, "rejected_applied")}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Rereject
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
