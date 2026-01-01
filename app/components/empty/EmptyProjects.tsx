import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import Link from "next/link";

export function EmptyProjects() {
  return (
    <Card className="p-8 text-center md:p-12">
      <FolderPlus className="mx-auto mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        No projects yet
      </h3>
      <p className="mb-6 text-sm text-gray-500">
        Create your first project to start analyzing test batches against system
        prompts.
      </p>
      <Link href="/projects/new">
        <Button>Create Project</Button>
      </Link>
    </Card>
  );
}
