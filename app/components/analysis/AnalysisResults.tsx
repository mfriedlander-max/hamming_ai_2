"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FailureCategoryCard } from "@/components/results/FailureCategoryCard";
import { EvidenceViewer } from "@/components/results/EvidenceViewer";
import { SuggestionCard } from "@/components/results/SuggestionCard";
import { useSuggestions } from "@/lib/hooks/useSuggestions";
import { useState } from "react";
import type { Analysis, TestBatch } from "@/types";
import Link from "next/link";

interface AnalysisResultsProps {
  analysis: Analysis;
  testBatch: TestBatch;
  selectedCategoryId?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
}

export function AnalysisResults({
  analysis,
  testBatch,
  selectedCategoryId: controlledCategoryId,
  onCategoryChange,
}: AnalysisResultsProps) {
  // Support both controlled (URL-based) and uncontrolled (local state) usage
  const [localCategoryId, setLocalCategoryId] = useState<string | null>(null);

  const isControlled = controlledCategoryId !== undefined && onCategoryChange !== undefined;
  const selectedCategoryId = isControlled ? controlledCategoryId : localCategoryId;
  const setSelectedCategoryId = isControlled ? onCategoryChange : setLocalCategoryId;

  const { suggestions, generating, generateForCategory } = useSuggestions(
    analysis.id
  );

  const selectedCategory = analysis.categories.find(
    (c) => c.id === selectedCategoryId
  );

  const categorySuggestions = selectedCategoryId
    ? suggestions.filter((s) => s.categoryId === selectedCategoryId)
    : [];

  const passRate = (
    (testBatch.passedTests / testBatch.totalTests) *
    100
  ).toFixed(1);

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const hasSuggestions = suggestions.length > 0;
  const pendingCount = pendingSuggestions.length;

  const handleGenerateSuggestions = () => {
    if (selectedCategory) {
      generateForCategory(
        analysis.systemPrompt,
        selectedCategory,
        testBatch.tests
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 transition-smooth">
        <h2 className="text-xl font-semibold text-gray-900">Analysis Summary</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
          <div>
            <p className="text-sm text-gray-600">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900">
              {testBatch.totalTests}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Passed</p>
            <p className="text-2xl font-bold text-green-600">
              {testBatch.passedTests}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {testBatch.failedTests}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pass Rate</p>
            <p className="text-2xl font-bold text-gray-900">{passRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Model</p>
            <p className="text-sm font-semibold text-gray-900">
              {analysis.metadata.modelUsed}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-sm font-semibold text-gray-900">
              {((analysis.metadata.durationMs ?? 0) / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        {hasSuggestions ? (
          <Link href={`/projects/${analysis.projectId}/editor`}>
            <Button size="lg">
              Review & Apply Suggestions ({pendingCount})
            </Button>
          </Link>
        ) : (
          <Button
            size="lg"
            disabled
            title="Generate suggestions first"
            className="cursor-not-allowed"
          >
            Review & Apply Suggestions (0)
          </Button>
        )}
      </div>

      {!selectedCategoryId && (
        <div>
          <h2 className="mb-1 text-xl font-semibold text-gray-900">
            Failure Categories ({analysis.categories.length})
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Click a category to view evidence & generate suggestions
          </p>
          <div className="space-y-4">
            {analysis.categories.map((category) => (
              <FailureCategoryCard
                key={category.id}
                category={category}
                onViewEvidence={() => setSelectedCategoryId(category.id)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedCategory && (
        <div>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            ← Back to categories
          </button>

          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            {selectedCategory.name}
          </h2>

          <EvidenceViewer
            evidence={selectedCategory.evidence}
            tests={testBatch.tests}
          />

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Suggested Fixes ({categorySuggestions.length})
              </h3>
              {categorySuggestions.length === 0 && (
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={generating}
                >
                  {generating ? "Generating..." : "Generate Suggestions"}
                </Button>
              )}
            </div>

            {categorySuggestions.length > 0 && (
              <div className="space-y-4">
                {categorySuggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            )}

            {categorySuggestions.length === 0 && !generating && (
              <Card className="p-8 text-center transition-smooth">
                <p className="text-gray-600">
                  No suggestions yet. Click "Generate Suggestions" to get
                  AI-powered fixes for this category.
                </p>
              </Card>
            )}

            {generating && (
              <Card className="p-8 text-center transition-smooth" role="status" aria-live="polite">
                <p className="text-gray-600">
                  Generating targeted prompt improvements...
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
