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
import { useDraftSuggestions } from "@/lib/hooks/useDraftSuggestions";
import { useVersions } from "@/lib/hooks/useVersions";
import { applyAcceptedSuggestions } from "@/lib/diff/applier";
import { canExportPrompt, EXPORT_DISABLED_MESSAGE } from "@/lib/utils/exportGating";
import { useState, useEffect } from "react";
import { Download, History, ArrowLeft } from "lucide-react";
import { ViewHistoryButton } from "@/components/shared/ViewHistoryButton";
import { ToastAction } from "@/components/ui/toast";
import { ExportDialog } from "@/components/export/ExportDialog";
import { exportPrompt } from "@/lib/export/prompt";
import { exportChangeReport } from "@/lib/export/report";
import { getVersionsByProject } from "@/lib/db/versions";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/layout/BackButton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AnalysisSkeleton } from "@/components/loading/AnalysisSkeleton";
import { getProject } from "@/lib/db/projects";
import type { Project } from "@/types";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { analysis, testBatch } = useAnalysis(projectId);
  const { suggestions } = useSuggestions(analysis?.id || "");
  const { versions, addVersion } = useVersions(projectId);

  // Check if export is available (V1+ exists)
  const exportEnabled = canExportPrompt(versions);

  // Use draft suggestions for local, reversible state management
  const {
    draftSuggestions,
    toggleAccept,
    setStatus,
    isDraftModified,
    acceptedCount,
    pendingCount,
  } = useDraftSuggestions(suggestions);

  const [updatedPrompt, setUpdatedPrompt] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Load project for breadcrumb
  useEffect(() => {
    async function loadProject() {
      const proj = await getProject(projectId);
      if (proj) {
        setProject(proj);
      }
    }
    loadProject();
  }, [projectId]);

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

    const acceptedSuggestions = draftSuggestions.filter((s) => s.status === "accepted");
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
      draftSuggestions,
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

  // Update preview based on draft suggestions (local state, instant updates)
  useEffect(() => {
    if (analysis && draftSuggestions.length > 0) {
      const result = applyAcceptedSuggestions(
        analysis.systemPrompt,
        draftSuggestions
      );
      if (result.success) {
        setUpdatedPrompt(result.updatedPrompt);
        setError(null);
      } else if (result.conflicts) {
        setError(`Conflicts detected: ${result.conflicts.length} suggestion(s)`);
      } else {
        // No accepted suggestions - show original prompt
        setUpdatedPrompt(analysis.systemPrompt);
        setError(null);
      }
    } else if (analysis) {
      setUpdatedPrompt(analysis.systemPrompt);
    }
  }, [analysis, draftSuggestions]);

  const handleApply = async () => {
    if (!analysis) return;

    if (!window.confirm("Apply accepted suggestions to create a new version?")) {
      return;
    }

    setApplying(true);
    try {
      // Use draftSuggestions for applying changes (creates NEW version, never mutates old)
      const result = applyAcceptedSuggestions(
        analysis.systemPrompt,
        draftSuggestions
      );

      if (!result.success) {
        if (result.conflicts) {
          setError(
            `Cannot apply: ${result.conflicts.length} conflicting suggestion(s)`
          );
        }
        return;
      }

      const acceptedSuggestions = draftSuggestions.filter(
        (s) => s.status === "accepted"
      );

      const changesSummary = `Applied ${acceptedSuggestions.length} suggestion(s)`;

      // Creates a NEW version - prior versions are NEVER modified
      const newVersion = await addVersion({
        content: result.updatedPrompt,
        createdBy: "system",
        appliedSuggestions: result.appliedSuggestions,
        changesSummary,
        analysisId: analysis.id,
      });

      toast({
        title: "Changes applied!",
        description: `Version ${newVersion?.id ? "created" : "saved"} with ${acceptedSuggestions.length} change(s).`,
        action: (
          <div className="flex gap-2">
            <ToastAction
              altText="View History"
              onClick={() => router.push(`/projects/${projectId}/history`)}
            >
              <History className="mr-1 h-3 w-3" />
              History
            </ToastAction>
            <ToastAction
              altText="Back to Project"
              onClick={() => router.push(`/projects/${projectId}`)}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Project
            </ToastAction>
          </div>
        ),
      });
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

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/projects/${projectId}`} label="Back to project" />
            <h1 className="text-3xl font-bold text-gray-900">Prompt Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Tertiary action: View History (ghost, separate) */}
            <ViewHistoryButton
              projectId={projectId}
              hasVersions={versions.length > 0}
              variant="ghost"
            />

            {/* Visual separator between history and export/apply actions */}
            {versions.length > 0 && (
              <div className="h-6 w-px bg-gray-200" />
            )}

            {/* Secondary actions: Export group (outline) */}
            <div className="flex items-center gap-2">
              <ExportDialog
                onExport={handleExportPrompt}
                formats={["txt", "md"]}
                title="Export Updated Prompt"
                description="Download the updated prompt"
                disabled={!exportEnabled}
                disabledMessage={EXPORT_DISABLED_MESSAGE}
              />
              <div className="relative group">
                <Button
                  onClick={handleExportReport}
                  variant="outline"
                  disabled={!exportEnabled}
                  title={!exportEnabled ? EXPORT_DISABLED_MESSAGE : undefined}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                {!exportEnabled && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {EXPORT_DISABLED_MESSAGE}
                  </div>
                )}
              </div>
            </div>

            {/* Primary action: Apply Changes (default, prominent) */}
            <Button
              onClick={handleApply}
              disabled={acceptedCount === 0 || applying}
              size="lg"
              className="ml-1"
            >
              {applying ? "Applying..." : `Apply ${acceptedCount} Change(s)`}
            </Button>
          </div>
        </div>

        <Breadcrumb
          projectId={projectId}
          projectName={project?.name || "Project"}
          currentPage="editor"
        />

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 transition-smooth">
            <p className="text-sm text-red-900">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <SuggestionPanel
              suggestions={draftSuggestions}
              onToggleAccept={toggleAccept}
              onSetStatus={setStatus}
              isDraftModified={isDraftModified}
              acceptedCount={acceptedCount}
              pendingCount={pendingCount}
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
