"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditEntry } from "@/types";
import type { ComponentType } from "react";
import { formatDistanceToNow } from "date-fns";

interface AuditEntryItemProps {
  entry: AuditEntry;
  config: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    color: string;
  };
}

export function AuditEntryItem({ entry, config }: AuditEntryItemProps) {
  const Icon = config.icon;

  return (
    <Card className="transition-smooth p-4 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{config.label}</span>
            <Badge variant="outline" className="text-xs">
              {entry.actor}
            </Badge>
          </div>

          {Object.keys(entry.details).length > 0 && (
            <div className="mt-1 text-sm text-gray-600">
              {Object.entries(entry.details).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
}
