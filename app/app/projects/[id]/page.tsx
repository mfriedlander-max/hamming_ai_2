"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { useAnalysis } from "@/lib/hooks/useAnalysis";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ExportDialog } from "@/components/export/ExportDialog";
import { exportPrompt } from "@/lib/export/prompt";
import { exportAnalysisJSON } from "@/lib/export/analysis";
import { Download } from "lucide-react";
import { AnalysisSkeleton } from "@/components/loading/AnalysisSkeleton";
import { EmptyTests } from "@/components/empty/EmptyTests";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/layout/BackButton";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { analysis, testBatch, loading, analyzing, error, runAnalysis } =
    useAnalysis(projectId);

  const [systemPrompt, setSystemPrompt] = useState("");
  const { toast } = useToast();

  const handleExportPrompt = (format: "txt" | "md" | "json") => {
    if (!analysis || format === "json") return;
    exportPrompt(analysis.systemPrompt, `prompt-original-${Date.now()}`, format);
    toast({
      title: "Export complete",
      description: "Prompt file downloaded.",
    });
  };

  const handleExportAnalysis = () => {
    if (!analysis || !testBatch) return;
    exportAnalysisJSON(analysis, testBatch, `analysis-${Date.now()}`);
    toast({
      title: "Export complete",
      description: "Analysis JSON downloaded.",
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <AnalysisSkeleton />
      </PageContainer>
    );
  }

  if (!testBatch) {
    return (
      <PageContainer>
        <EmptyTests />
      </PageContainer>
    );
  }

  const handleAnalyze = () => {
    if (systemPrompt.trim()) {
      runAnalysis(systemPrompt);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/dashboard" label="Back to dashboard" />
            <h1 className="text-3xl font-bold text-gray-900">Project Analysis</h1>
          </div>
          <Link href={`/projects/${projectId}/history`}>
            <Button variant="outline">View History</Button>
          </Link>
        </div>

        {!analysis && (
          <Card className="p-6 transition-smooth">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">System Prompt to Analyze</Label>
                <Textarea
                  id="prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Paste your system prompt here..."
                  className="mt-2 min-h-[200px] font-mono text-sm"
                  aria-describedby="prompt-help"
                />
                <p id="prompt-help" className="mt-2 text-xs text-gray-500">
                  Provide the system prompt you want analyzed.
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!systemPrompt.trim() || analyzing}
              >
                {analyzing ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </Card>
        )}

        {analyzing && (
          <Card className="p-8 text-center transition-smooth" role="status" aria-live="polite">
            <p className="text-lg text-gray-600">Analyzing test failures...</p>
            <p className="mt-2 text-sm text-gray-500">
              Claude is categorizing failures and extracting evidence
            </p>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-6 transition-smooth">
            <p className="font-medium text-red-900">Analysis Failed</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </Card>
        )}

        {analysis && testBatch && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <ExportDialog
                onExport={handleExportPrompt}
                formats={["txt", "md"]}
                title="Export Prompt"
                description="Download the system prompt"
              />
              <Button onClick={handleExportAnalysis} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Analysis
              </Button>
            </div>
            <AnalysisResults analysis={analysis} testBatch={testBatch} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
