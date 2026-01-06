"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, ChevronRight } from "lucide-react";
import type { FailureCategory } from "@/types";

interface FailureCategoryCardProps {
  category: FailureCategory;
  onViewEvidence?: () => void;
}

export function FailureCategoryCard({
  category,
  onViewEvidence,
}: FailureCategoryCardProps) {
  const severityConfig = {
    high: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    medium: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    low: {
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  };

  const config = severityConfig[category.severity];
  const Icon = config.icon;

  return (
    <Card
      className={`transition-smooth cursor-pointer p-6 ${config.borderColor} ${config.bgColor} hover:bg-gray-50 hover:shadow-md`}
      onClick={onViewEvidence}
    >
      <div className="flex items-start gap-4">
        <Icon className={`h-6 w-6 ${config.color} flex-shrink-0`} />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {category.name}
            </h3>
            <Badge
              variant={
                category.severity === "high" ? "destructive" : "secondary"
              }
            >
              {category.severity}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-gray-700">{category.description}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <span>{category.count} affected tests</span>
            <span>•</span>
            <span>{category.evidence.length} evidence snippets</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 self-center" />
      </div>
    </Card>
  );
}
