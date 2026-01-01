import type { EvidenceSnippet } from "./analysis";

export interface Suggestion {
  id: string;
  analysisId: string;
  categoryId: string;
  type: "add" | "remove" | "replace";
  targetSection?: string;
  originalText?: string;
  proposedText: string;
  reason: string;
  linkedTestIds: string[];
  evidence: EvidenceSnippet[];
  status: "pending" | "accepted" | "rejected";
  reviewedAt?: number;
  reviewNotes?: string;
  diffPatch?: string;
  lineNumbers?: {
    start: number;
    end: number;
  };
}
