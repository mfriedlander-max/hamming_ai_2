import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, FileText } from "lucide-react";
import Link from "next/link";

interface EmptyProjectsProps {
  isInSubfolder?: boolean;
  folderName?: string;
  folderId?: string;
  hasExistingPrompts?: boolean;
}

export function EmptyProjects({
  isInSubfolder = false,
  folderName,
  folderId,
  hasExistingPrompts = false,
}: EmptyProjectsProps) {
  if (isInSubfolder) {
    return (
      <Card className="p-8 text-center md:p-12">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          No iterations yet
        </h3>
        <p className="mb-6 text-sm text-gray-500 max-w-md mx-auto">
          Upload a test batch and system prompt to create your first iteration.
          Analyze results, refine your prompt, and iterate to improve.
        </p>
        <Link href={folderId ? `/projects/new?folderId=${folderId}` : "/projects/new"}>
          <Button>New Iteration</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center md:p-12">
      <FilePlus className="mx-auto mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        {hasExistingPrompts ? "Create a new prompt" : "Create your first prompt"}
      </h3>
      <p className="mb-6 text-sm text-gray-500 max-w-md mx-auto">
        {hasExistingPrompts
          ? "Create another prompt and start your analysis. As a reminder, each prompt contains multiple iterations as you refine and improve."
          : "Create your first prompt to start your analysis. Each prompt contains multiple iterations as you refine and improve."}
      </p>
      <Link href="/dashboard?newPrompt=true">
        <Button>New Prompt</Button>
      </Link>
    </Card>
  );
}
