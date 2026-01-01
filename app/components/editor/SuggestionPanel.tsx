"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Circle } from "lucide-react";
import type { Suggestion } from "@/types";
import { updateSuggestionStatus } from "@/lib/db/suggestions";
import { AcceptRejectControls } from "@/components/editor/AcceptRejectControls";
import { useToast } from "@/hooks/use-toast";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onStatusChange: () => void;
}

export function SuggestionPanel({
  suggestions,
  onStatusChange,
}: SuggestionPanelProps) {
  const { toast } = useToast();

  const handleAccept = async (id: string) => {
    await updateSuggestionStatus(id, "accepted");
    onStatusChange();
    toast({
      title: "Suggestion accepted",
      description: "This change will be applied when you update the prompt.",
    });
  };

  const handleReject = async (id: string) => {
    await updateSuggestionStatus(id, "rejected");
    onStatusChange();
    toast({
      title: "Suggestion rejected",
      description: "This change will not be applied.",
    });
  };

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;
  const acceptedCount = suggestions.filter((s) => s.status === "accepted").length;

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
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="transition-smooth p-4 hover:shadow-sm">
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
                </div>
                <p className="mt-2 text-sm text-gray-900">{suggestion.reason}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {suggestion.linkedTestIds.length} test(s)
                </p>
              </div>

              {suggestion.status === "pending" && (
                <AcceptRejectControls
                  onAccept={() => handleAccept(suggestion.id)}
                  onReject={() => handleReject(suggestion.id)}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
