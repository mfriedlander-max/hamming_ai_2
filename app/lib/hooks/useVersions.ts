"use client";

import { useState, useEffect } from "react";
import type { PromptVersion } from "@/types";
import { getVersionsByProject, createVersion } from "@/lib/db/versions";

export function useVersions(projectId: string) {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await getVersionsByProject(projectId);
      setVersions(data);
    } catch (error) {
      console.error("Failed to load versions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addVersion = async (data: {
    content: string;
    createdBy: "user" | "system";
    changedFrom?: string;
    appliedSuggestions?: string[];
    changesSummary?: string;
    analysisId?: string;
    acceptedSuggestionIds?: string[];
    rejectedSuggestionIds?: string[];
  }) => {
    const version = await createVersion({
      projectId,
      ...data,
    });
    setVersions((prev) => [...prev, version]);
    return version;
  };

  return {
    versions,
    loading,
    addVersion,
    refresh: loadVersions,
  };
}
