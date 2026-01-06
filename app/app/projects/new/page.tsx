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
import { createProject, DuplicateProjectNameError } from "@/lib/db/projects";
import { createTestBatch } from "@/lib/db/testBatches";
import type { TestResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/layout/BackButton";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [uploadedTests, setUploadedTests] = useState<{
    tests: TestResult[];
    fileName: string;
    fileType: "json" | "csv" | "excel";
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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

    setCreating(true);

    try {
      const project = await createProject({
        name: projectName.trim(),
        systemPrompt: systemPrompt.trim(),
      });

      await createTestBatch({
        projectId: project.id,
        fileName: uploadedTests!.fileName,
        fileType: uploadedTests!.fileType,
        tests: uploadedTests!.tests,
      });

      toast({
        title: "Project created",
        description: "Your analysis is ready to review.",
      });
      router.push(`/projects/${project.id}`);
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
    } finally {
      setCreating(false);
    }
  };

  const canCreate = projectName.trim() && systemPrompt.trim() && uploadedTests;

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
            />
            {errors.prompt && (
              <p className="text-sm text-red-600">{errors.prompt}</p>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || creating}>
            {creating ? "Creating..." : "Create & Analyze"}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
