"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadTestBatch } from "@/components/analysis/UploadTestBatch";
import { PromptInput } from "@/components/analysis/PromptInput";
import { DuplicateProjectNameError } from "@/lib/db/projects";
import { useFullAnalysisPipeline } from "@/lib/hooks/useFullAnalysisPipeline";
import type { TestResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/layout/BackButton";
import { Loader2 } from "lucide-react";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [uploadedTests, setUploadedTests] = useState<{
    tests: TestResult[];
    fileName: string;
    fileType: "json" | "csv" | "excel";
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { progress, runPipeline, isRunning } = useFullAnalysisPipeline();

  const handleUpload = (
    tests: TestResult[],
    fileName: string,
    fileType: "json" | "csv" | "excel"
  ) => {
    setUploadedTests({ tests, fileName, fileType });
  };

  const handleCreate = async () => {
    const nextErrors: Record<string, string> = {};
    if (!projectName.trim()) {
      nextErrors.name = "Project name is required.";
    }
    if (!systemPrompt.trim()) {
      nextErrors.prompt = "System prompt is required.";
    }
    if (!uploadedTests) {
      nextErrors.tests = "Please upload a test batch.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await runPipeline({
        projectName: projectName.trim(),
        systemPrompt: systemPrompt.trim(),
        tests: uploadedTests!.tests,
        fileName: uploadedTests!.fileName,
        fileType: uploadedTests!.fileType,
      });

      if (!result.success) {
        toast({
          title: "Analysis failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      if (error instanceof DuplicateProjectNameError) {
        setErrors((prev) => ({
          ...prev,
          name: `${error.message} Try "${error.suggestedName}" instead.`,
        }));
      } else {
        toast({
          title: "Failed to create project",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const canCreate = projectName.trim() && systemPrompt.trim() && uploadedTests;

  const getProgressMessage = () => {
    if (progress.step === "generating" && progress.currentCategory && progress.totalCategories) {
      return `${progress.message} (${progress.currentCategory}/${progress.totalCategories})`;
    }
    return progress.message;
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/dashboard" label="Back to dashboard" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Analysis</h1>
              <p className="mt-2 text-gray-600">
                Upload your test batch and system prompt to get started
              </p>
            </div>
          </div>
        </div>

        <Card className="p-6 transition-smooth">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-base font-semibold">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => {
                      const { name, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder="e.g., Customer Support Bot v2"
                className={errors.name ? "border-red-500" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "project-name-error" : undefined}
                disabled={isRunning}
              />
              {errors.name && (
                <p id="project-name-error" className="text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-4 text-base font-semibold">Upload Test Batch</h3>
              <UploadTestBatch
                onUpload={(tests, fileName, fileType) => {
                  handleUpload(tests, fileName, fileType);
                  if (errors.tests) {
                    setErrors((prev) => {
                      const { tests: _, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                disabled={isRunning}
              />
              {errors.tests && (
                <p className="mt-2 text-sm text-red-600">{errors.tests}</p>
              )}
            </div>

            <PromptInput
              value={systemPrompt}
              onChange={(value) => {
                setSystemPrompt(value);
                if (errors.prompt) {
                  setErrors((prev) => {
                    const { prompt, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              disabled={isRunning}
            />
            {errors.prompt && (
              <p className="text-sm text-red-600">{errors.prompt}</p>
            )}
          </div>
        </Card>

        {/* Progress indicator */}
        {isRunning && (
          <Card className="p-4 transition-smooth">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{getProgressMessage()}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: progress.step === "creating" ? "10%" :
                             progress.step === "analyzing" ? "30%" :
                             progress.step === "generating" && progress.currentCategory && progress.totalCategories
                               ? `${30 + (progress.currentCategory / progress.totalCategories) * 60}%`
                               : progress.step === "complete" ? "100%" : "0%"
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {progress.step === "error" && (
          <Card className="border-red-200 bg-red-50 p-4 transition-smooth">
            <p className="text-sm text-red-900">{progress.error}</p>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isRunning}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || isRunning}>
            {isRunning ? "Processing..." : "Create & Analyze"}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
