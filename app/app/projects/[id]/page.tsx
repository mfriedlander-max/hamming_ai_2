"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Loader2 } from "lucide-react";

export default function ProjectRedirect() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  useEffect(() => {
    router.replace(`/projects/${projectId}/editor`);
  }, [router, projectId]);

  return (
    <PageContainer>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Redirecting to editor...</span>
        </div>
      </div>
    </PageContainer>
  );
}
