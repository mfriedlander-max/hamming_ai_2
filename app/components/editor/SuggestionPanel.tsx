"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Circle, Undo2 } from "lucide-react";
import type { Suggestion } from "@/types";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onToggleAccept: (id: string) => void;
  onSetStatus: (id: string, status: "pending" | "accepted" | "rejected") => void;
  isDraftModified?: (id: string) => boolean;
  acceptedCount: number;
  pendingCount: number;
}

export function SuggestionPanel({
  suggestions,
  onToggleAccept,
  onSetStatus,
  isDraftModified,
  acceptedCount,
  pendingCount,
}: SuggestionPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Suggestions ({suggestions.length})
        </h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">{acceptedCount} accepted</span>
          <span className="text-gray-600">{pendingCount} pending</span>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const isModified = isDraftModified?.(suggestion.id) ?? false;

          return (
            <Card
              key={suggestion.id}
              className={`transition-smooth p-4 hover:shadow-sm ${
                isModified ? "ring-2 ring-blue-200 ring-offset-1" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {suggestion.status === "accepted" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {suggestion.status === "rejected" && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {suggestion.status === "pending" && (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <Badge variant="outline">{suggestion.type}</Badge>
                    {isModified && (
                      <Badge variant="secondary" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-900">{suggestion.reason}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {suggestion.linkedTestIds.length} test(s)
                  </p>
                </div>

                <div className="flex gap-2">
                  {suggestion.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => onToggleAccept(suggestion.id)}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSetStatus(suggestion.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {suggestion.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleAccept(suggestion.id)}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <Undo2 className="mr-1 h-3 w-3" />
                      Un-accept
                    </Button>
                  )}
                  {suggestion.status === "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSetStatus(suggestion.id, "pending")}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Undo2 className="mr-1 h-3 w-3" />
                      Undo
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
