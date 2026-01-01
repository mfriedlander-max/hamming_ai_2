"use client";

import {
  FileText,
  Upload,
  Brain,
  CheckCircle,
  XCircle,
  Download,
  RotateCcw,
  Plus,
} from "lucide-react";
import type { AuditEntry } from "@/types";
import { AuditEntryItem } from "@/components/history/AuditEntryItem";

interface AuditTrailProps {
  entries: AuditEntry[];
}

const actionConfig: Record<
  AuditEntry["action"],
  { icon: any; label: string; color: string }
> = {
  created_project: {
    icon: Plus,
    label: "Created Project",
    color: "bg-green-100 text-green-800",
  },
  uploaded_prompt: {
    icon: Upload,
    label: "Uploaded Prompt",
    color: "bg-blue-100 text-blue-800",
  },
  analyzed: {
    icon: Brain,
    label: "Analyzed Failures",
    color: "bg-purple-100 text-purple-800",
  },
  accepted_suggestion: {
    icon: CheckCircle,
    label: "Accepted Suggestion",
    color: "bg-green-100 text-green-800",
  },
  rejected_suggestion: {
    icon: XCircle,
    label: "Rejected Suggestion",
    color: "bg-red-100 text-red-800",
  },
  exported: {
    icon: Download,
    label: "Exported",
    color: "bg-gray-100 text-gray-800",
  },
  created_version: {
    icon: FileText,
    label: "Created Version",
    color: "bg-blue-100 text-blue-800",
  },
  rollback_version: {
    icon: RotateCcw,
    label: "Rolled Back",
    color: "bg-yellow-100 text-yellow-800",
  },
};

export function AuditTrail({ entries }: AuditTrailProps) {
  const grouped = entries.reduce<Record<string, AuditEntry[]>>((acc, entry) => {
    const dateKey = new Date(entry.timestamp).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const groupedEntries = Object.entries(grouped);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Activity Log ({entries.length})
      </h2>

      <div className="space-y-6">
        {groupedEntries.map(([date, dateEntries]) => (
          <div key={date} className="space-y-2">
            <p className="text-xs font-semibold text-gray-500">{date}</p>
            {dateEntries.map((entry) => (
              <AuditEntryItem
                key={entry.id}
                entry={entry}
                config={actionConfig[entry.action]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
