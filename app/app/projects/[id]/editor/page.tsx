"use client";

import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiffViewer } from "@/components/editor/DiffViewer";
import { PromptPreview } from "@/components/editor/PromptPreview";
import { SuggestionPanel } from "@/components/editor/SuggestionPanel";
import { useAnalysis } from "@/lib/hooks/useAnalysis";
import { useSuggestions } from "@/lib/hooks/useSuggestions";
import { useVersions } from "@/lib/hooks/useVersions";
import { applyAcceptedSuggestions } from "@/lib/diff/applier";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { ExportDialog } from "@/components/export/ExportDialog";
import { exportPrompt } from "@/lib/export/prompt";
import { exportChangeReport } from "@/lib/export/report";
import { getVersionsByProject } from "@/lib/db/versions";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/layout/BackButton";
import { AnalysisSkeleton } from "@/components/loading/AnalysisSkeleton";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { analysis, testBatch } = useAnalysis(projectId);
  const { suggestions, refresh: refreshSuggestions } = useSuggestions(
    analysis?.id || ""
  );
  const { addVersion } = useVersions(projectId);

  const [updatedPrompt, setUpdatedPrompt] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExportPrompt = (format: "txt" | "md" | "json") => {
    if (!analysis || format === "json") return;
    exportPrompt(updatedPrompt, `prompt-v${Date.now()}`, format);
    toast({
      title: "Export complete",
      description: "Updated prompt downloaded.",
    });
  };

  const handleExportReport = async () => {
    if (!analysis || !testBatch) return;

    const acceptedSuggestions = suggestions.filter((s) => s.status === "accepted");
    if (acceptedSuggestions.length === 0) {
      toast({
        title: "No accepted suggestions",
        description: "Accept at least one suggestion to export a report.",
        variant: "destructive",
      });
      return;
    }

    const versions = await getVersionsByProject(projectId);
    if (versions.length === 0) {
      toast({
        title: "No versions found",
        description: "Apply changes to create a version before exporting.",
        variant: "destructive",
      });
      return;
    }
    const currentVersion = versions[versions.length - 1];
    const previousVersion = versions[versions.length - 2] || currentVersion;

    exportChangeReport(
      analysis,
      suggestions,
      currentVersion,
      previousVersion,
      testBatch,
      `change-report-${Date.now()}`
    );
    toast({
      title: "Export complete",
      description: "Change report downloaded.",
    });
  };

  useEffect(() => {
    if (analysis && suggestions.length > 0) {
      const result = applyAcceptedSuggestions(
        analysis.systemPrompt,
        suggestions
      );
      if (result.success) {
        setUpdatedPrompt(result.updatedPrompt);
        setError(null);
      } else if (result.conflicts) {
        setError(`Conflicts detected: ${result.conflicts.length} suggestion(s)`);
      }
    } else if (analysis) {
      setUpdatedPrompt(analysis.systemPrompt);
    }
  }, [analysis, suggestions]);

  const handleApply = async () => {
    if (!analysis) return;

    if (!window.confirm("Apply accepted suggestions to create a new version?")) {
      return;
    }

    setApplying(true);
    try {
      const result = applyAcceptedSuggestions(
        analysis.systemPrompt,
        suggestions
      );

      if (!result.success) {
        if (result.conflicts) {
          setError(
            `Cannot apply: ${result.conflicts.length} conflicting suggestion(s)`
          );
        }
        return;
      }

      const acceptedSuggestions = suggestions.filter(
        (s) => s.status === "accepted"
      );

      const changesSummary = `Applied ${acceptedSuggestions.length} suggestion(s)`;

      await addVersion({
        content: result.updatedPrompt,
        createdBy: "system",
        appliedSuggestions: result.appliedSuggestions,
        changesSummary,
        analysisId: analysis.id,
      });

      toast({
        title: "Version created",
        description: "Your prompt has been updated.",
      });

      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to apply changes");
      toast({
        title: "Failed to apply changes",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (!analysis) {
    return (
      <PageContainer>
        <AnalysisSkeleton />
      </PageContainer>
    );
  }

  const acceptedCount = suggestions.filter((s) => s.status === "accepted").length;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/projects/${projectId}`} label="Back to project" />
            <h1 className="text-3xl font-bold text-gray-900">Prompt Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportDialog
              onExport={handleExportPrompt}
              formats={["txt", "md"]}
              title="Export Updated Prompt"
              description="Download the updated prompt"
            />
            <Button onClick={handleExportReport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button
              onClick={handleApply}
              disabled={acceptedCount === 0 || applying}
              size="lg"
            >
              {applying ? "Applying..." : `Apply ${acceptedCount} Change(s)`}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 transition-smooth">
            <p className="text-sm text-red-900">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <SuggestionPanel
              suggestions={suggestions}
              onStatusChange={refreshSuggestions}
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card className="p-4 transition-smooth">
              <p className="text-sm text-gray-600">
                {acceptedCount > 0
                  ? `${acceptedCount} accepted suggestion(s) will be applied.`
                  : "Accept suggestions to preview changes."}
              </p>
            </Card>
            <DiffViewer
              original={analysis.systemPrompt}
              modified={updatedPrompt}
            />
            <PromptPreview content={updatedPrompt} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
