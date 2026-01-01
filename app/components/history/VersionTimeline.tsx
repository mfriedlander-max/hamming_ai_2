"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Bot } from "lucide-react";
import type { PromptVersion } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface VersionTimelineProps {
  versions: PromptVersion[];
  onSelectVersion: (version: PromptVersion) => void;
  onCompare?: (v1: PromptVersion, v2: PromptVersion) => void;
  selectedVersion?: PromptVersion;
}

export function VersionTimeline({
  versions,
  onSelectVersion,
  onCompare,
  selectedVersion,
}: VersionTimelineProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Version History ({versions.length})
      </h2>

      <div className="space-y-3">
        {versions.map((version, index) => {
          const isLatest = index === versions.length - 1;
          const isSelected = selectedVersion?.id === version.id;

          const borderTone =
            version.createdBy === "system" ? "border-l-blue-400" : "border-l-gray-300";

          return (
            <Card
              key={version.id}
              className={`transition-smooth border-l-4 p-4 ${borderTone} ${
                isSelected ? "border-blue-500 bg-blue-50" : "hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      Version {version.versionNumber}
                    </h3>
                    {isLatest && <Badge variant="default">Current</Badge>}
                    {version.createdBy === "user" && (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                    {version.createdBy === "system" && (
                      <Bot className="h-4 w-4 text-blue-600" />
                    )}
                  </div>

                  {version.changesSummary && (
                    <p className="mt-1 text-sm text-gray-700">
                      {version.changesSummary}
                    </p>
                  )}

                  {version.appliedSuggestions &&
                    version.appliedSuggestions.length > 0 && (
                      <p className="mt-1 text-xs text-gray-600">
                        Applied {version.appliedSuggestions.length} suggestion(s)
                      </p>
                    )}

                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(version.createdAt, {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectVersion(version)}
                  >
                    View
                  </Button>
                  {onCompare && !isLatest && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onCompare(version, versions[versions.length - 1])
                      }
                    >
                      Compare
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
