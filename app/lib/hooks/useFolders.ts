"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Folder } from "@/types";
import {
  getAllFolders,
  createFolder as dbCreateFolder,
  deleteFolder as dbDeleteFolder,
  updateFolder as dbUpdateFolder,
  getFolder,
  ensureDefaultFolder,
  getProjectCountInFolder,
  getFolderIterationPassRates,
} from "@/lib/db/folders";
import { DEFAULT_FOLDER_ID } from "@/types/folder";

export interface FolderWithCount extends Folder {
  projectCount: number;
  iterationPassRates: number[];
  latestPassRate?: number;
}

export function useFolders() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  // Initialize from URL param if present
  const folderParam = searchParams.get("folder");
  const [currentFolderId, setCurrentFolderId] = useState<string>(folderParam || DEFAULT_FOLDER_ID);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state with URL param changes
  useEffect(() => {
    const paramFolderId = searchParams.get("folder") || DEFAULT_FOLDER_ID;
    if (paramFolderId !== currentFolderId) {
      setCurrentFolderId(paramFolderId);
    }
  }, [searchParams, currentFolderId]);

  const loadFolders = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure default folder exists
      await ensureDefaultFolder();

      const allFolders = await getAllFolders();

      // Get project counts and pass rates for each folder
      const foldersWithCounts = await Promise.all(
        allFolders.map(async (folder) => {
          const [projectCount, iterationPassRates] = await Promise.all([
            getProjectCountInFolder(folder.id),
            getFolderIterationPassRates(folder.id),
          ]);
          const latestPassRate = iterationPassRates.length > 0
            ? iterationPassRates[iterationPassRates.length - 1]
            : undefined;
          return { ...folder, projectCount, iterationPassRates, latestPassRate };
        })
      );

      setFolders(foldersWithCounts);

      // Update current folder info
      const current = allFolders.find(f => f.id === currentFolderId);
      setCurrentFolder(current || null);
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const createFolder = useCallback(async (name: string) => {
    const folder = await dbCreateFolder(name);
    await loadFolders();
    return folder;
  }, [loadFolders]);

  const deleteFolder = useCallback(async (id: string) => {
    await dbDeleteFolder(id);
    // If we're in the deleted folder, navigate back to default
    if (currentFolderId === id) {
      setCurrentFolderId(DEFAULT_FOLDER_ID);
    }
    await loadFolders();
  }, [currentFolderId, loadFolders]);

  const renameFolder = useCallback(async (id: string, newName: string) => {
    await dbUpdateFolder(id, { name: newName });
    await loadFolders();
  }, [loadFolders]);

  const navigateToFolder = useCallback((id: string) => {
    if (id === DEFAULT_FOLDER_ID) {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?folder=${id}`);
    }
  }, [router]);

  const refresh = loadFolders;

  const isInSubfolder = currentFolderId !== DEFAULT_FOLDER_ID;

  return {
    folders,
    currentFolderId,
    currentFolder,
    loading,
    isInSubfolder,
    createFolder,
    deleteFolder,
    renameFolder,
    navigateToFolder,
    refresh,
  };
}
