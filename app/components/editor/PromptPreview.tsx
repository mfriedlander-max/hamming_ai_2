"use client";

import { Card } from "@/components/ui/card";

interface PromptPreviewProps {
  content: string;
}

export function PromptPreview({ content }: PromptPreviewProps) {
  return (
    <Card className="p-6 transition-smooth">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Updated Prompt Preview
      </h3>
      <div className="rounded bg-gray-50 p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
          {content}
        </pre>
      </div>
    </Card>
  );
}
