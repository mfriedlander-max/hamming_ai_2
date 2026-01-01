export interface PromptVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  content: string;
  createdAt: number;
  createdBy: "user" | "system";
  changedFrom?: string;
  appliedSuggestions?: string[];
  changesSummary?: string;
  analysisId?: string;
}

export interface AuditEntry {
  id: string;
  projectId: string;
  timestamp: number;
  action:
    | "created_project"
    | "uploaded_prompt"
    | "analyzed"
    | "accepted_suggestion"
    | "rejected_suggestion"
    | "exported"
    | "created_version"
    | "rollback_version";
  actor: string;
  details: Record<string, any>;
  relatedEntities: {
    versionId?: string;
    analysisId?: string;
    suggestionId?: string;
  };
}
