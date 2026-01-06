import Dexie, { type Table } from "dexie";
import type {
  Project,
  TestBatch,
  Analysis,
  Suggestion,
  PromptVersion,
  AuditEntry,
  Folder,
} from "@/types";
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from "@/types/folder";

export class AppDatabase extends Dexie {
  projects!: Table<Project>;
  testBatches!: Table<TestBatch>;
  analyses!: Table<Analysis>;
  suggestions!: Table<Suggestion>;
  versions!: Table<PromptVersion>;
  auditLog!: Table<AuditEntry>;
  folders!: Table<Folder>;

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

    // Version 2: Add folders table and folderId to projects
    this.version(2)
      .stores({
        projects: "id, createdAt, updatedAt, folderId",
        testBatches: "id, projectId, uploadedAt",
        analyses: "id, projectId, testBatchId, analyzedAt",
        suggestions: "id, analysisId, categoryId, status",
        versions: "id, projectId, versionNumber, createdAt",
        auditLog: "id, projectId, timestamp, action",
        folders: "id, name, parentId, createdAt, updatedAt",
      })
      .upgrade(async (tx) => {
        // Create default folder (idempotent - check if exists first)
        const foldersTable = tx.table<Folder>("folders");
        const existingDefault = await foldersTable.get(DEFAULT_FOLDER_ID);

        if (!existingDefault) {
          const now = Date.now();
          await foldersTable.add({
            id: DEFAULT_FOLDER_ID,
            name: DEFAULT_FOLDER_NAME,
            createdAt: now,
            updatedAt: now,
          });
        }

        // Backfill all existing projects with folderId = DEFAULT_FOLDER_ID
        const projectsTable = tx.table<Project>("projects");
        await projectsTable.toCollection().modify((project) => {
          if (!project.folderId) {
            project.folderId = DEFAULT_FOLDER_ID;
          }
        });
      });
  }
}

export const db = new AppDatabase();
