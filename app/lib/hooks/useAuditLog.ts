"use client";

import { useState, useEffect } from "react";
import type { AuditEntry } from "@/types";
import { getAuditLog, createAuditEntry } from "@/lib/db/auditLog";

export function useAuditLog(projectId: string) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [projectId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getAuditLog(projectId);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load audit log:", error);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (data: {
    action: AuditEntry["action"];
    actor: string;
    details: Record<string, any>;
    relatedEntities?: AuditEntry["relatedEntities"];
  }) => {
    const entry = await createAuditEntry({
      projectId,
      ...data,
    });
    setEntries((prev) => [entry, ...prev]);
    return entry;
  };

  return {
    entries,
    loading,
    logAction,
    refresh: loadEntries,
  };
}
