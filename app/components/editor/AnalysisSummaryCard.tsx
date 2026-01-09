"use client";

import { Card } from "@/components/ui/card";
import type { TestBatch } from "@/types";

interface AnalysisSummaryCardProps {
  testBatch: TestBatch;
}

export function AnalysisSummaryCard({ testBatch }: AnalysisSummaryCardProps) {
  const passRate = ((testBatch.passedTests / testBatch.totalTests) * 100).toFixed(1);

  return (
    <Card className="p-4 transition-smooth">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Test Results</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Total:</span>
            <span className="font-medium text-gray-900">{testBatch.totalTests}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Passed:</span>
            <span className="font-medium text-green-600">{testBatch.passedTests}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Failed:</span>
            <span className="font-medium text-red-600">{testBatch.failedTests}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Pass Rate:</span>
            <span className="font-medium text-gray-900">{passRate}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
