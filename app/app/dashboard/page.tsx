"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { ProjectSkeleton } from "@/components/loading/ProjectSkeleton";
import { EmptyProjects } from "@/components/empty/EmptyProjects";

export default function DashboardPage() {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <PageContainer>
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-live="polite"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectSkeleton key={index} />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Link href="/projects/new">
          <Button>New Analysis</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyProjects />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-smooth p-6 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {project.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  {project.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
