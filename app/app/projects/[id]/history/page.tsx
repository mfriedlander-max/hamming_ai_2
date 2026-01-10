"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VersionTimeline } from "@/components/history/VersionTimeline";
import { VersionDiff } from "@/components/history/VersionDiff";
import { AuditTrail } from "@/components/history/AuditTrail";
import { useVersions } from "@/lib/hooks/useVersions";
import { useAuditLog } from "@/lib/hooks/useAuditLog";
import { canExportPrompt, EXPORT_DISABLED_MESSAGE } from "@/lib/utils/exportGating";
import { useState, useEffect } from "react";
import type { PromptVersion } from "@/types";
import { ExportDialog } from "@/components/export/ExportDialog";
import { exportPrompt } from "@/lib/export/prompt";
import { exportChangeReport } from "@/lib/export/report";
import { db } from "@/lib/db/client";
import type { Analysis, Suggestion, TestBatch, Project } from "@/types";
import { BackButton } from "@/components/layout/BackButton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { VersionSkeleton } from "@/components/loading/VersionSkeleton";
import { EmptyVersions } from "@/components/empty/EmptyVersions";
import { useToast } from "@/hooks/use-toast";
import { getProject } from "@/lib/db/projects";
import { resetSuggestionsForAnalysis, restoreSuggestionStatesForVersion } from "@/lib/db/suggestions";
import { Copy, Check, Download } from "lucide-react";

export default function HistoryPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { versions, loading: versionsLoading, addVersion, refresh } =
    useVersions(projectId);
  const { entries, loading: auditLoading, logAction, refresh: refreshAudit } =
    useAuditLog(projectId);

  // Check if export is available (V1+ exists)
  const exportEnabled = canExportPrompt(versions);

  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(
    null
  );
  const [compareVersions, setCompareVersions] = useState<{
    versionA: PromptVersion;
    versionB: PromptVersion;
  } | null>(null);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null);
  const [latestSuggestions, setLatestSuggestions] = useState<Suggestion[]>([]);
  const [latestTestBatch, setLatestTestBatch] = useState<TestBatch | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyPrompt = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Prompt content has been copied.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy prompt to clipboard.",
        variant: "destructive",
      });
    }
  };

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

  useEffect(() => {
    const loadLatestData = async () => {
      if (versions.length < 2) return;

      const latestVersion = versions[versions.length - 1];
      if (!latestVersion.analysisId) return;

      try {
        const analysis = await db.analyses.get(latestVersion.analysisId);
        if (!analysis) return;

        setLatestAnalysis(analysis);

        const suggestions = await db.suggestions
          .where("analysisId")
          .equals(latestVersion.analysisId)
          .toArray();
        setLatestSuggestions(suggestions);

        const testBatch = await db.testBatches.get(analysis.testBatchId);
        setLatestTestBatch(testBatch || null);
      } catch (error) {
        console.error("Failed to load latest data:", error);
      }
    };

    loadLatestData();
  }, [versions]);

  const handleExportLatest = (format: "txt" | "md" | "json") => {
    const latest = versions[versions.length - 1];
    if (!latest || format === "json") return;
    exportPrompt(latest.content, `prompt-v${latest.versionNumber}`, format);
    toast({
      title: "Export complete",
      description: "Prompt file downloaded.",
    });
  };

  const handleExportReport = () => {
    if (!latestAnalysis || !latestTestBatch || versions.length < 2) {
      toast({
        title: "Unable to export report",
        description: "Create at least two versions to generate a report.",
        variant: "destructive",
      });
      return;
    }

    const latestVersion = versions[versions.length - 1];
    const previousVersion = versions[versions.length - 2];

    exportChangeReport(
      latestAnalysis,
      latestSuggestions,
      latestVersion,
      previousVersion,
      latestTestBatch,
      `change-report-v${latestVersion.versionNumber}`
    );
    toast({
      title: "Export complete",
      description: "Change report downloaded.",
    });
  };

  const handleCompare = (v1: PromptVersion, v2: PromptVersion) => {
    setCompareVersions({ versionA: v1, versionB: v2 });
    setSelectedVersion(null);
  };

  const handleViewVersion = (version: PromptVersion) => {
    setSelectedVersion(version);
    setCompareVersions(null);
  };

  const handleRollback = async () => {
    if (!selectedVersion) return;
    setRollingBack(true);
    setRollbackError(null);

    try {
      const newVersion = await addVersion({
        content: selectedVersion.content,
        createdBy: "user",
        changedFrom: selectedVersion.id,
        changesSummary: `Rollback to version ${selectedVersion.versionNumber}`,
        analysisId: selectedVersion.analysisId,
        acceptedSuggestionIds: selectedVersion.acceptedSuggestionIds,
        rejectedSuggestionIds: selectedVersion.rejectedSuggestionIds,
      });

      // Restore suggestion states to match the target version
      // Find analysis from any version that has one (rollback versions don't have analysisId)
      const analysisId = latestAnalysis?.id ||
        versions.find(v => v.analysisId)?.analysisId;
      if (analysisId) {
        // If the target version has acceptedSuggestionIds/rejectedSuggestionIds, restore to that state
        // Otherwise, reset all to pending (for versions created before this feature)
        if (selectedVersion.acceptedSuggestionIds || selectedVersion.rejectedSuggestionIds) {
          await restoreSuggestionStatesForVersion(
            analysisId,
            selectedVersion.acceptedSuggestionIds || [],
            selectedVersion.rejectedSuggestionIds || []
          );
        } else {
          await resetSuggestionsForAnalysis(analysisId);
        }
      }

      await logAction({
        action: "rollback_version",
        actor: "user",
        details: {
          rolledBackTo: selectedVersion.versionNumber,
        },
        relatedEntities: {
          versionId: newVersion.id,
        },
      });

      await refresh();
      await refreshAudit();
      setSelectedVersion(null);

      const hasStoredStates = selectedVersion.acceptedSuggestionIds || selectedVersion.rejectedSuggestionIds;
      toast({
        title: "Rollback complete",
        description: hasStoredStates
          ? `Version ${selectedVersion.versionNumber} restored with suggestion states.`
          : `Version ${selectedVersion.versionNumber} restored. Suggestions reset to pending.`,
      });
    } catch (error: any) {
      setRollbackError(error.message || "Failed to rollback version");
      toast({
        title: "Rollback failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRollingBack(false);
    }
  };

  if (versionsLoading || auditLoading) {
    return (
      <PageContainer>
        <VersionSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/projects/${projectId}`} label="Back to project" />
            <h1 className="text-3xl font-bold text-gray-900">Project History</h1>
          </div>
          <div className="flex gap-2">
            {versions.length > 0 && (
              <ExportDialog
                onExport={handleExportLatest}
                formats={["txt", "md"]}
                title="Export Latest Prompt"
                description="Download the latest prompt version"
                disabled={!exportEnabled}
                disabledMessage={EXPORT_DISABLED_MESSAGE}
              />
            )}
            {latestAnalysis && latestTestBatch && versions.length >= 2 && (
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
            )}
          </div>
        </div>

        <Breadcrumb
          projectId={projectId}
          projectName={project?.name || "Project"}
          currentPage="history"
        />

        <Tabs defaultValue="versions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="versions" className="space-y-6">
            {compareVersions ? (
              <VersionDiff
                versionA={compareVersions.versionA}
                versionB={compareVersions.versionB}
                onClose={() => setCompareVersions(null)}
              />
            ) : selectedVersion ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back to timeline
                </button>
                <Card className="p-6 transition-smooth">
                  <div className="flex items-center justify-between">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                      Version {selectedVersion.versionNumber}
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCopyPrompt(selectedVersion.content)}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRollback}
                        disabled={rollingBack}
                      >
                        {rollingBack ? "Rolling back..." : "Rollback to this"}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded bg-gray-50 p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                      {selectedVersion.content}
                    </pre>
                  </div>
                  {selectedVersion.changesSummary && (
                    <p className="mt-4 text-sm text-gray-600">
                      {selectedVersion.changesSummary}
                    </p>
                  )}
                </Card>
                {rollbackError && (
                  <Card className="border-red-200 bg-red-50 p-4 transition-smooth">
                    <p className="text-sm text-red-900">{rollbackError}</p>
                  </Card>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-3">
                  {versions.length === 0 ? (
                    <EmptyVersions />
                  ) : (
                    <VersionTimeline
                      versions={versions}
                      onSelectVersion={handleViewVersion}
                      onCompare={handleCompare}
                      selectedVersion={selectedVersion || undefined}
                    />
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <AuditTrail entries={entries} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
