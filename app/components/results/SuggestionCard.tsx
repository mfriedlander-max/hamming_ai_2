"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileEdit, CheckCircle, XCircle } from "lucide-react";
import type { Suggestion } from "@/types";
import { useState } from "react";
import { TestLinkage } from "@/components/results/TestLinkage";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept?: () => void;
  onReject?: () => void;
}

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: SuggestionCardProps) {
  const [showDiff, setShowDiff] = useState(false);

  const typeColors = {
    add: "bg-green-100 text-green-800",
    remove: "bg-red-100 text-red-800",
    replace: "bg-blue-100 text-blue-800",
  };

  const statusIcons = {
    pending: null,
    accepted: <CheckCircle className="h-5 w-5 text-green-600" />,
    rejected: <XCircle className="h-5 w-5 text-red-600" />,
  };

  return (
    <Card className="transition-smooth p-6 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileEdit className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge className={typeColors[suggestion.type]}>
                {suggestion.type}
              </Badge>
              {suggestion.targetSection && (
                <span className="text-sm text-gray-600">
                  → {suggestion.targetSection}
                </span>
              )}
              {statusIcons[suggestion.status]}
            </div>

            <p className="mt-3 text-sm text-gray-900">
              <span className="font-medium">Reason:</span> {suggestion.reason}
            </p>

            <div className="mt-3">
              <TestLinkage testIds={suggestion.linkedTestIds} />
            </div>

            <div className="mt-4 rounded bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-700">
                Proposed Change:
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                {suggestion.proposedText}
              </pre>
            </div>

            {suggestion.originalText && (
              <div className="mt-2 rounded bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">
                  {suggestion.type === "replace" ? "Replaces:" : "Removes:"}
                </p>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-red-900">
                  {suggestion.originalText}
                </pre>
              </div>
            )}

            {suggestion.evidence.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs font-medium text-gray-700">
                  View evidence ({suggestion.evidence.length})
                </summary>
                <div className="mt-2 space-y-2">
                  {suggestion.evidence.map((ev, idx) => (
                    <div key={idx} className="rounded bg-gray-50 p-2">
                      <p className="text-xs text-gray-600">
                        Test {ev.testId}:
                      </p>
                      <p className="mt-1 text-xs text-gray-900">
                        "{ev.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {suggestion.diffPatch && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiff(!showDiff)}
                >
                  {showDiff ? "Hide" : "Show"} Diff
                </Button>
                {showDiff && (
                  <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
                    {suggestion.diffPatch}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {suggestion.status === "pending" && (onAccept || onReject) && (
          <div className="flex gap-2">
            {onAccept && (
              <Button size="sm" onClick={onAccept}>
                Accept
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" onClick={onReject}>
                Reject
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
