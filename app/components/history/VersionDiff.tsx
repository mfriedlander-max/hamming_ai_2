"use client";

import { Card } from "@/components/ui/card";
import { DiffViewer } from "@/components/editor/DiffViewer";
import type { PromptVersion } from "@/types";

interface VersionDiffProps {
  versionA: PromptVersion;
  versionB: PromptVersion;
  onClose?: () => void;
}

export function VersionDiff({ versionA, versionB, onClose }: VersionDiffProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Comparing Versions
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:underline"
          >
            Close Comparison
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900">
            Version {versionA.versionNumber}
          </h3>
          <p className="text-sm text-gray-600">
            {versionA.changesSummary || "Original version"}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900">
            Version {versionB.versionNumber}
          </h3>
          <p className="text-sm text-gray-600">
            {versionB.changesSummary || "Current version"}
          </p>
        </Card>
      </div>

      <div className="transition-smooth">
        <DiffViewer original={versionA.content} modified={versionB.content} />
      </div>
    </div>
  );
}
