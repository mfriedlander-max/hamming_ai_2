"use client";

import { Card } from "@/components/ui/card";
import * as Diff from "diff";

interface DiffViewerProps {
  original: string;
  modified: string;
}

export function DiffViewer({ original, modified }: DiffViewerProps) {
  const changes = Diff.diffLines(original, modified);

  let oldLine = 1;
  let newLine = 1;

  const leftLines: Array<{ line: number | null; value: string; type: string }> =
    [];
  const rightLines: Array<{ line: number | null; value: string; type: string }> =
    [];

  changes.forEach((change) => {
    const lines = change.value.split("\n");
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === "") return;

      if (change.removed) {
        leftLines.push({ line: oldLine++, value: line, type: "removed" });
        rightLines.push({ line: null, value: "", type: "empty" });
      } else if (change.added) {
        leftLines.push({ line: null, value: "", type: "empty" });
        rightLines.push({ line: newLine++, value: line, type: "added" });
      } else {
        leftLines.push({ line: oldLine++, value: line, type: "unchanged" });
        rightLines.push({ line: newLine++, value: line, type: "unchanged" });
      }
    });
  });

  return (
    <Card className="transition-smooth overflow-hidden">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        <div className="bg-gray-50 p-4 md:border-r">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Original</h3>
          <div className="max-h-[500px] overflow-y-auto">
            <pre className="text-xs leading-relaxed text-gray-900">
              {leftLines.map((line, idx) => (
                <div
                  key={idx}
                  className={
                    line.type === "removed"
                      ? "bg-red-100 text-red-900"
                      : "text-gray-600"
                  }
                >
                  <span className="mr-3 inline-block w-8 text-right text-gray-400">
                    {line.line ?? ""}
                  </span>
                  {line.value || " "}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Modified</h3>
          <div className="max-h-[500px] overflow-y-auto">
            <pre className="text-xs leading-relaxed text-gray-900">
              {rightLines.map((line, idx) => (
                <div
                  key={idx}
                  className={
                    line.type === "added"
                      ? "bg-green-100 text-green-900"
                      : "text-gray-600"
                  }
                >
                  <span className="mr-3 inline-block w-8 text-right text-gray-400">
                    {line.line ?? ""}
                  </span>
                  {line.value || " "}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
}
