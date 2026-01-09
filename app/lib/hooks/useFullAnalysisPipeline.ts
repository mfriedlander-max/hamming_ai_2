"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/db/projects";
import { createTestBatch } from "@/lib/db/testBatches";
import { createVersion } from "@/lib/db/versions";
import { createAnalysis } from "@/lib/db/analyses";
import { createSuggestion } from "@/lib/db/suggestions";
import { filterValidTests } from "@/lib/validation/testValidation";
import type { TestResult, FailureCategory } from "@/types";

export type PipelineStep = "idle" | "creating" | "analyzing" | "generating" | "complete" | "error";

export interface PipelineProgress {
  step: PipelineStep;
  message: string;
  currentCategory?: number;
  totalCategories?: number;
  error?: string;
  projectId?: string;
}

interface PipelineInput {
  projectName: string;
  systemPrompt: string;
  tests: TestResult[];
  fileName: string;
  fileType: "json" | "csv" | "excel";
  folderId?: string;
}

export function useFullAnalysisPipeline() {
  const router = useRouter();
  const [progress, setProgress] = useState<PipelineProgress>({
    step: "idle",
    message: "",
  });

  const runPipeline = useCallback(async (input: PipelineInput) => {
    const { projectName, systemPrompt, tests, fileName, fileType, folderId } = input;

    try {
      // Step 1: Create project, test batch, and initial version
      setProgress({ step: "creating", message: "Creating project..." });

      const project = await createProject({
        name: projectName,
        systemPrompt,
        folderId,
      });

      const testBatch = await createTestBatch({
        projectId: project.id,
        fileName,
        fileType,
        tests,
      });

      await createVersion({
        projectId: project.id,
        content: systemPrompt,
        createdBy: "user",
        changesSummary: "Initial prompt",
      });

      // Step 2: Run analysis
      setProgress({
        step: "analyzing",
        message: "Analyzing test failures...",
        projectId: project.id,
      });

      const failedTests = tests.filter((t) => t.status === "fail");

      if (failedTests.length === 0) {
        // No failures - skip analysis, go directly to editor
        setProgress({
          step: "complete",
          message: "No failures to analyze!",
          projectId: project.id,
        });
        router.push(`/projects/${project.id}/editor`);
        return { success: true, projectId: project.id };
      }

      const analysisResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_failures",
          payload: { systemPrompt, failedTests },
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const { categories } = await analysisResponse.json();
      const startTime = Date.now();

      const analysis = await createAnalysis({
        projectId: project.id,
        testBatchId: testBatch.id,
        systemPrompt,
        categories,
        metadata: {
          modelUsed: "claude-sonnet-4-20250514",
          durationMs: Date.now() - startTime,
        },
      });

      // Step 3: Generate suggestions for each category
      const validCategories = categories.filter((cat: FailureCategory) => {
        const categoryTestIds = new Set(cat.affectedTestIds);
        const categoryTests = tests.filter((t) => categoryTestIds.has(t.id));
        const { valid } = filterValidTests(categoryTests);
        return valid.length > 0;
      });

      for (let i = 0; i < validCategories.length; i++) {
        const category = validCategories[i];

        setProgress({
          step: "generating",
          message: `Generating suggestions for "${category.name}"...`,
          currentCategory: i + 1,
          totalCategories: validCategories.length,
          projectId: project.id,
        });

        const categoryTestIds = new Set(category.affectedTestIds);
        const categoryTests = tests.filter((t) => categoryTestIds.has(t.id));
        const { valid: validTests } = filterValidTests(categoryTests);

        try {
          const suggestionsResponse = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "generate_suggestions",
              payload: {
                systemPrompt,
                category,
                allTests: validTests,
              },
            }),
          });

          if (suggestionsResponse.ok) {
            const { suggestions: suggestionData } = await suggestionsResponse.json();

            await Promise.all(
              suggestionData.map((s: any) =>
                createSuggestion({
                  analysisId: analysis.id,
                  categoryId: category.id,
                  type: s.type,
                  targetSection: s.targetSection,
                  originalText: s.originalText,
                  proposedText: s.proposedText,
                  reason: s.reason,
                  linkedTestIds: s.linkedTestIds,
                  evidence: category.evidence.filter((ev: any) =>
                    s.linkedTestIds.includes(ev.testId)
                  ),
                  originalPrompt: systemPrompt,
                })
              )
            );
          }
        } catch (err) {
          // Log but continue with other categories
          console.error(`Failed to generate suggestions for category ${category.name}:`, err);
        }
      }

      // Step 4: Complete - navigate to editor
      setProgress({
        step: "complete",
        message: "Analysis complete!",
        projectId: project.id,
      });

      router.push(`/projects/${project.id}/editor`);
      return { success: true, projectId: project.id };

    } catch (err: any) {
      console.error("Pipeline error:", err);
      setProgress({
        step: "error",
        message: "Analysis failed",
        error: err.message || "An unexpected error occurred",
      });
      return { success: false, error: err.message };
    }
  }, [router]);

  const reset = useCallback(() => {
    setProgress({ step: "idle", message: "" });
  }, []);

  return {
    progress,
    runPipeline,
    reset,
    isRunning: progress.step !== "idle" && progress.step !== "complete" && progress.step !== "error",
  };
}
