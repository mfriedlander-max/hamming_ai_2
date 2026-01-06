import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FileText } from "lucide-react";
import Link from "next/link";

interface EmptyProjectsProps {
  isInSubfolder?: boolean;
  folderName?: string;
}

export function EmptyProjects({ isInSubfolder = false, folderName }: EmptyProjectsProps) {
  if (isInSubfolder) {
    return (
      <Card className="p-8 text-center md:p-12">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          No projects in this folder
        </h3>
        <p className="mb-6 text-sm text-gray-500">
          {folderName ? (
            <>
              &quot;{folderName}&quot; is empty. Create a new project or move existing projects here.
            </>
          ) : (
            "This folder is empty. Create a new project or move existing projects here."
          )}
        </p>
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </Card>
    );
  }

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
