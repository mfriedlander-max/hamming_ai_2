import Dexie, { type Table } from "dexie";
import type {
  Project,
  TestBatch,
  Analysis,
  Suggestion,
  PromptVersion,
  AuditEntry,
} from "@/types";

export class AppDatabase extends Dexie {
  projects!: Table<Project>;
  testBatches!: Table<TestBatch>;
  analyses!: Table<Analysis>;
  suggestions!: Table<Suggestion>;
  versions!: Table<PromptVersion>;
  auditLog!: Table<AuditEntry>;

  constructor() {
    super("PromptEngineeringDB");

    this.version(1).stores({
      projects: "id, createdAt, updatedAt",
      testBatches: "id, projectId, uploadedAt",
      analyses: "id, projectId, testBatchId, analyzedAt",
      suggestions: "id, analysisId, categoryId, status",
      versions: "id, projectId, versionNumber, createdAt",
      auditLog: "id, projectId, timestamp, action",
    });
  }
}

export const db = new AppDatabase();
