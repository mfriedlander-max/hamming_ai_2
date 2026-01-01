import type { Analysis, TestBatch } from "@/types";

export function exportAnalysisJSON(
  analysis: Analysis,
  testBatch: TestBatch,
  filename: string
): void {
  const exportData = {
    analysis: {
      id: analysis.id,
      analyzedAt: new Date(analysis.analyzedAt).toISOString(),
      systemPrompt: analysis.systemPrompt,
      categories: analysis.categories,
      metadata: analysis.metadata,
    },
    testBatch: {
      fileName: testBatch.fileName,
      fileType: testBatch.fileType,
      totalTests: testBatch.totalTests,
      passedTests: testBatch.passedTests,
      failedTests: testBatch.failedTests,
      uploadedAt: new Date(testBatch.uploadedAt).toISOString(),
    },
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, `${filename}.json`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
