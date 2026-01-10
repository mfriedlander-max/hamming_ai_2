import { nanoid } from "nanoid";
import { db } from "./client";
import type { Folder } from "@/types";
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from "@/types/folder";

export class CannotDeleteDefaultFolderError extends Error {
  constructor() {
    super("Cannot delete the default folder.");
    this.name = "CannotDeleteDefaultFolderError";
  }
}

export class FolderNotFoundError extends Error {
  constructor(id: string) {
    super(`Folder with id "${id}" not found.`);
    this.name = "FolderNotFoundError";
  }
}

/**
 * Ensures the default folder exists in the database.
 * This is idempotent and safe to call multiple times.
 */
export async function ensureDefaultFolder(): Promise<Folder> {
  const existing = await db.folders.get(DEFAULT_FOLDER_ID);
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const defaultFolder: Folder = {
    id: DEFAULT_FOLDER_ID,
    name: DEFAULT_FOLDER_NAME,
    createdAt: now,
    updatedAt: now,
  };

  await db.folders.add(defaultFolder);
  return defaultFolder;
}

/**
 * Creates a new folder with the given name and optional parent.
 */
export async function createFolder(
  name: string,
  parentId?: string
): Promise<Folder> {
  const now = Date.now();
  const folder: Folder = {
    id: nanoid(),
    name,
    parentId,
    createdAt: now,
    updatedAt: now,
  };

  await db.folders.add(folder);
  return folder;
}

/**
 * Gets a folder by id.
 */
export async function getFolder(id: string): Promise<Folder | undefined> {
  return await db.folders.get(id);
}

/**
 * Gets all folders, ordered by creation time.
 */
export async function getAllFolders(): Promise<Folder[]> {
  return await db.folders.orderBy("createdAt").toArray();
}

/**
 * Gets folders by parent id.
 * If parentId is undefined, returns root-level folders (those without a parent).
 */
export async function getFoldersByParent(parentId?: string): Promise<Folder[]> {
  if (parentId === undefined) {
    // Get root-level folders (those without parentId)
    const allFolders = await db.folders.toArray();
    return allFolders.filter((f) => f.parentId === undefined);
  }
  return await db.folders.where("parentId").equals(parentId).toArray();
}

/**
 * Updates a folder with the given changes.
 */
export async function updateFolder(
  id: string,
  updates: Partial<Pick<Folder, "name" | "parentId">>
): Promise<void> {
  const existing = await db.folders.get(id);
  if (!existing) {
    throw new FolderNotFoundError(id);
  }

  await db.folders.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Deletes a folder by id.
 * SAFETY: Cannot delete the default folder.
 * SAFETY: Moves all projects in the folder to the default folder before deletion.
 */
export async function deleteFolder(id: string): Promise<void> {
  // Cannot delete default folder
  if (id === DEFAULT_FOLDER_ID) {
    throw new CannotDeleteDefaultFolderError();
  }

  const existing = await db.folders.get(id);
  if (!existing) {
    throw new FolderNotFoundError(id);
  }

  // Ensure default folder exists before moving projects
  await ensureDefaultFolder();

  // Move all projects in this folder to the default folder
  await db.projects
    .where("folderId")
    .equals(id)
    .modify({ folderId: DEFAULT_FOLDER_ID, updatedAt: Date.now() });

  // Now safe to delete the folder
  await db.folders.delete(id);
}

/**
 * Gets the count of projects in a folder.
 */
export async function getProjectCountInFolder(folderId: string): Promise<number> {
  return await db.projects.where("folderId").equals(folderId).count();
}

/**
 * Gets pass rates for all iterations (projects) in a folder.
 * Returns an array of pass rates ordered by createdAt (oldest first).
 */
export async function getFolderIterationPassRates(folderId: string): Promise<number[]> {
  // Get all projects in the folder, ordered by createdAt
  const projects = await db.projects
    .where("folderId")
    .equals(folderId)
    .sortBy("createdAt");

  // Get pass rates for each project
  const passRates: number[] = [];

  for (const project of projects) {
    // Get the latest analysis for this project
    const analyses = await db.analyses
      .where("projectId")
      .equals(project.id)
      .reverse()
      .toArray();

    const latestAnalysis = analyses[0];
    if (latestAnalysis?.testBatchId) {
      const testBatch = await db.testBatches.get(latestAnalysis.testBatchId);
      if (testBatch && testBatch.tests.length > 0) {
        const passedTests = testBatch.tests.filter((t) => t.status === "pass").length;
        const passRate = Math.round((passedTests / testBatch.tests.length) * 100);
        passRates.push(passRate);
      }
    }
  }

  return passRates;
}

export { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME };
