"use client";

import { useState, useEffect } from "react";
import type { Analysis, TestBatch } from "@/types";
import { getLatestAnalysis, createAnalysis } from "@/lib/db/analyses";
import { getTestBatchesByProject } from "@/lib/db/testBatches";

export function useAnalysis(projectId: string) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [testBatch, setTestBatch] = useState<TestBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [projectId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const latestAnalysis = await getLatestAnalysis(projectId);
      setAnalysis(latestAnalysis || null);

      const testBatches = await getTestBatchesByProject(projectId);
      setTestBatch(testBatches[0] || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (systemPrompt: string) => {
    if (!testBatch) {
      setError("No test batch found");
      return;
    }

    setAnalyzing(true);
    setError(null);

    const startTime = Date.now();

    try {
      const failedTests = testBatch.tests.filter((t) => t.status === "fail");

      if (failedTests.length === 0) {
        throw new Error("No failed tests to analyze");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_failures",
          payload: {
            systemPrompt,
            failedTests,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const { categories } = await response.json();

      const durationMs = Date.now() - startTime;

      const newAnalysis = await createAnalysis({
        projectId,
        testBatchId: testBatch.id,
        systemPrompt,
        categories,
        metadata: {
          modelUsed: "claude-sonnet-4-20250514",
          durationMs,
        },
      });

      setAnalysis(newAnalysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze");
      console.error("Analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analysis,
    testBatch,
    loading,
    analyzing,
    error,
    runAnalysis,
    refresh: loadAnalysis,
  };
}
