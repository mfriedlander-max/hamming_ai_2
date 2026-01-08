"use client";

import { FileText } from "lucide-react";

interface TestLinkageProps {
  testIds: string[];
}

export function TestLinkage({ testIds }: TestLinkageProps) {
  if (!testIds || testIds.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
      <FileText className="h-3 w-3" />
      <span>From Test: {testIds.join(', ')}</span>
    </div>
  );
}
