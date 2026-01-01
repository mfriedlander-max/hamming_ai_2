import type { TestResult } from "./test-batch";

export interface EvidenceSnippet {
  testId: string;
  excerpt: string;
  highlightStart?: number;
  highlightEnd?: number;
  context?: string;
}

export interface FailureCategory {
  id: string;
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
  affectedTestIds: string[];
  evidence: EvidenceSnippet[];
  count: number;
}

export interface Analysis {
  id: string;
  projectId: string;
  testBatchId: string;
  systemPrompt: string;
  analyzedAt: number;
  categories: FailureCategory[];
  rawClaudeResponse?: string;
  metadata: {
    modelUsed: string;
    tokensUsed?: number;
    durationMs: number;
  };
}
