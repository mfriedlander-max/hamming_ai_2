"use client";

import { Card } from "@/components/ui/card";
import type { EvidenceSnippet, TestResult } from "@/types";

interface EvidenceViewerProps {
  evidence: EvidenceSnippet[];
  tests: TestResult[];
}

export function EvidenceViewer({ evidence, tests }: EvidenceViewerProps) {
  const getTest = (testId: string) => tests.find((t) => t.id === testId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Evidence</h3>
      {evidence.map((ev, index) => {
        const test = getTest(ev.testId);
        return (
          <Card key={index} className="transition-smooth p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Test ID: {ev.testId}
                </span>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <p className="whitespace-pre-wrap text-sm text-gray-900">
                  {ev.excerpt}
                </p>
              </div>
              {ev.context && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Context:</span> {ev.context}
                </p>
              )}
              {test && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-gray-700">
                    View full transcript
                  </summary>
                  <div className="mt-2 rounded bg-gray-50 p-3">
                    <p className="whitespace-pre-wrap text-xs text-gray-900">
                      {test.transcript}
                    </p>
                  </div>
                </details>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
