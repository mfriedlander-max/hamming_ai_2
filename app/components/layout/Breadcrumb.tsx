"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  projectId: string;
  projectName: string;
  currentPage?: "project" | "editor" | "history";
}

export function Breadcrumb({
  projectId,
  projectName,
  currentPage = "project",
}: BreadcrumbProps) {
  const pageLabels: Record<string, string> = {
    project: "Analysis",
    editor: "Editor",
    history: "History",
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-gray-600"
    >
      <Link
        href="/dashboard"
        className="hover:text-gray-900 hover:underline transition-colors"
      >
        Dashboard
      </Link>
      <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
      <Link
        href={`/projects/${projectId}`}
        className={`hover:text-gray-900 hover:underline transition-colors ${
          currentPage === "project" ? "font-medium text-gray-900" : ""
        }`}
      >
        {projectName}
      </Link>
      {currentPage !== "project" && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <span className="font-medium text-gray-900">
            {pageLabels[currentPage]}
          </span>
        </>
      )}
    </nav>
  );
}
