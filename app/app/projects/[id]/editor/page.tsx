"use client";

import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiffViewer } from "@/components/editor/DiffViewer";
import { PromptPreview } from "@/components/editor/PromptPreview";
import { CategorizedSuggestionPanel } from "@/components/editor/CategorizedSuggestionPanel";
import { AnalysisSummaryCard } from "@/components/editor/AnalysisSummaryCard";
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
  const { suggestions, markAsApplied } = useSuggestions(analysis?.id || "");
  const { versions, addVersion, loading: versionsLoading } = useVersions(projectId);

  // Check if export is available (V1+ exists)
  const exportEnabled = canExportPrompt(versions);

  // Get latest version content as baseline for creating new versions
  // Only compute when versions are fully loaded to avoid showing stale data
  const latestVersion = !versionsLoading && versions.length > 0 ? versions[versions.length - 1] : null;
  const baselinePrompt = latestVersion?.content || analysis?.systemPrompt || "";

  // For diff preview, use the latest version as baseline
  // After Apply, this updates so the diff only shows unapplied changes
  const originalPrompt = baselinePrompt;

  // Use draft suggestions for local, reversible state management
  const {
    draftSuggestions,
    toggleAccept,
    setStatus,
    isDraftModified,
    getOriginalStatus,
    acceptedCount,
    pendingCount,
    rejectedCount,
    appliedCount,
    revertedAppliedCount,
    revertedRejectedCount,
    applyableCount,
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

    const acceptedSuggestions = draftSuggestions.filter(
      (s) => s.status === "accepted" || s.status === "applied"
    );
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
  // Uses baselinePrompt (latest version) as originalPrompt
  // Only applies pending decisions (accepted/rejected) - applied suggestions are already in baseline
  useEffect(() => {
    if (originalPrompt && draftSuggestions.length > 0) {
      const result = applyAcceptedSuggestions(
        originalPrompt,
        draftSuggestions
        // Don't include applied suggestions - they're already in the baseline
      );
      if (result.success) {
        setUpdatedPrompt(result.updatedPrompt);
        setError(null);
      } else if (result.conflicts) {
        setError(`Conflicts detected: ${result.conflicts.length} suggestion(s)`);
      } else {
        // No pending decisions - show baseline prompt (no changes)
        setUpdatedPrompt(originalPrompt);
        setError(null);
      }
    } else if (originalPrompt) {
      setUpdatedPrompt(originalPrompt);
    }
  }, [originalPrompt, draftSuggestions]);

  const handleApply = async () => {
    if (!analysis) return;

    if (!window.confirm("Apply decided suggestions to create a new version?")) {
      return;
    }

    setApplying(true);
    try {
      // Use draftSuggestions for applying changes (creates NEW version, never mutates old)
      // Apply from baselinePrompt (latest version), not analysis.systemPrompt (original)
      const result = applyAcceptedSuggestions(
        baselinePrompt,
        draftSuggestions
      );

      if (!result.success) {
        if (result.conflicts) {
          setError(
            `Cannot apply: ${result.conflicts.length} conflicting suggestion(s)`
          );
        } else {
          // No decided suggestions
          toast({
            title: "No changes to apply",
            description: "Accept or reject at least one suggestion first.",
            variant: "destructive",
          });
        }
        return;
      }

      const totalApplied = result.appliedSuggestions.length + result.rejectedSuggestions.length;

      // Prevent creating empty versions when all suggestions failed to apply
      if (totalApplied === 0) {
        toast({
          title: "No changes applied",
          description: "All suggestions failed to apply. They may have conflicts with the current prompt.",
          variant: "destructive",
        });
        return;
      }
      const changesSummary = `Applied ${result.appliedSuggestions.length} accepted, ${result.rejectedSuggestions.length} rejected`;

      // Creates a NEW version - prior versions are NEVER modified
      const newVersion = await addVersion({
        content: result.updatedPrompt,
        createdBy: "system",
        appliedSuggestions: [...result.appliedSuggestions, ...result.rejectedSuggestions],
        changesSummary,
        analysisId: analysis.id,
        // Track accepted vs rejected separately for rollback state restoration
        acceptedSuggestionIds: result.appliedSuggestions,
        rejectedSuggestionIds: result.rejectedSuggestions,
      });

      // Track which suggestions were reverted before applying
      // These must return to pending regardless of applier result
      // (applier may fail on reverted suggestions, so they won't appear in result arrays)
      const revertedSuggestions = draftSuggestions.filter(
        s => s.status === "reverted_applied" || s.status === "reverted_rejected"
      );
      const revertedIds = new Set(revertedSuggestions.map(s => s.id));

      // First, set ALL reverted suggestions to pending
      // They won't be in result arrays because applier throws errors on them
      revertedSuggestions.forEach((s) => {
        setStatus(s.id, "pending");
      });

      // Update local draft state for non-reverted suggestions:
      // - accepted -> applied
      // - rejected -> rejected_applied
      result.appliedSuggestions.forEach((id) => {
        if (!revertedIds.has(id)) {
          setStatus(id, "applied");
        }
      });
      result.rejectedSuggestions.forEach((id) => {
        if (!revertedIds.has(id)) {
          setStatus(id, "rejected_applied");
        }
      });

      // Mark in database as well
      await markAsApplied([...result.appliedSuggestions, ...result.rejectedSuggestions]);

      toast({
        title: "Changes applied!",
        description: `Version ${newVersion?.id ? "created" : "saved"} with ${totalApplied} change(s).`,
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
              altText="Back to Dashboard"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Dashboard
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

  if (!analysis || versionsLoading) {
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
            <BackButton href="/dashboard" label="Back to dashboard" />
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
              disabled={applyableCount === 0 || applying}
              size="lg"
              className="ml-1"
              data-tour="apply-changes"
            >
              {applying ? "Applying..." : `Apply ${applyableCount} Change(s)`}
            </Button>
          </div>
        </div>

        <Breadcrumb
          projectId={projectId}
          projectName={project?.name || "Project"}
          currentPage="editor"
        />

        {testBatch && <AnalysisSummaryCard testBatch={testBatch} />}

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 transition-smooth">
            <p className="text-sm text-red-900">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start" data-tour="suggestions-panel">
            <CategorizedSuggestionPanel
              categories={analysis.categories}
              suggestions={draftSuggestions}
              onToggleAccept={toggleAccept}
              onSetStatus={setStatus}
              isDraftModified={isDraftModified}
              getOriginalStatus={getOriginalStatus}
              acceptedCount={acceptedCount}
              pendingCount={pendingCount}
              appliedCount={appliedCount}
              rejectedCount={rejectedCount}
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card className="p-4 transition-smooth">
              <p className="text-sm text-gray-600">
                {applyableCount > 0
                  ? `${applyableCount} change(s) will be applied: ${acceptedCount} accepted, ${rejectedCount} rejected${revertedAppliedCount + revertedRejectedCount > 0 ? `, ${revertedAppliedCount + revertedRejectedCount} reverted` : ""}.`
                  : "Accept or reject suggestions to preview changes."}
              </p>
            </Card>
            <div data-tour="diff-viewer">
              <DiffViewer
                original={originalPrompt}
                modified={updatedPrompt}
              />
            </div>
            <PromptPreview content={updatedPrompt} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
