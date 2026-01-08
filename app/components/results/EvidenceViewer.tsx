"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { EvidenceSnippet, TestResult } from "@/types";
import {
  isValidTest,
  getTestValidationError,
  filterValidTests,
} from "@/lib/validation/testValidation";

interface EvidenceViewerProps {
  evidence: EvidenceSnippet[];
  tests: TestResult[];
}

export function EvidenceViewer({ evidence, tests }: EvidenceViewerProps) {
  const getTest = (testId: string) => tests.find((t) => t.id === testId);

  // Calculate validation summary for all tests referenced by evidence
  const referencedTestIds = new Set(evidence.map((ev) => ev.testId));
  const referencedTests = tests.filter((t) => referencedTestIds.has(t.id));
  const { invalid, summary } = filterValidTests(referencedTests);
  const invalidTestIds = new Set(invalid.map((t) => t.id));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Evidence</h3>

      {summary && (
        <div
          className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
          <span className="text-sm text-yellow-800">{summary}</span>
        </div>
      )}

      {evidence.map((ev, index) => {
        const test = getTest(ev.testId);
        const testIsInvalid = test ? !isValidTest(test) : false;
        const validationError = test ? getTestValidationError(test) : null;

        return (
          <Card
            key={index}
            className={`transition-smooth p-4 ${testIsInvalid ? "opacity-50" : ""}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Test ID: {ev.testId}
                  </span>
                  {testIsInvalid && validationError && (
                    <span
                      title={validationError}
                      className="inline-flex items-center"
                      aria-label={`Invalid test: ${validationError}`}
                    >
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </span>
                  )}
                </div>
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
              {test && !testIsInvalid && (
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
