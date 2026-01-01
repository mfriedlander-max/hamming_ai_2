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
import { useState, useEffect } from "react";
import type { PromptVersion } from "@/types";
import { ExportDialog } from "@/components/export/ExportDialog";
import { exportPrompt } from "@/lib/export/prompt";
import { exportChangeReport } from "@/lib/export/report";
import { db } from "@/lib/db/client";
import type { Analysis, Suggestion, TestBatch } from "@/types";
import { BackButton } from "@/components/layout/BackButton";
import { VersionSkeleton } from "@/components/loading/VersionSkeleton";
import { EmptyVersions } from "@/components/empty/EmptyVersions";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { versions, loading: versionsLoading, addVersion, refresh } =
    useVersions(projectId);
  const { entries, loading: auditLoading, logAction, refresh: refreshAudit } =
    useAuditLog(projectId);

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
  const { toast } = useToast();

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
      });

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
      toast({
        title: "Rollback complete",
        description: `Version ${selectedVersion.versionNumber} restored.`,
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
              />
            )}
            {latestAnalysis && latestTestBatch && versions.length >= 2 && (
              <Button onClick={handleExportReport} variant="outline">
                Export Report
              </Button>
            )}
          </div>
        </div>

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
                    <Button
                      variant="outline"
                      onClick={handleRollback}
                      disabled={rollingBack}
                    >
                      {rollingBack ? "Rolling back..." : "Rollback to this"}
                    </Button>
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
