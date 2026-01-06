"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptPreviewProps {
  content: string;
}

export function PromptPreview({ content }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (isModal = false) => {
    try {
      await navigator.clipboard.writeText(content);
      if (isModal) {
        setModalCopied(true);
        setTimeout(() => setModalCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="p-6 transition-smooth">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Updated Prompt Preview
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1"
            >
              <Maximize2 className="h-4 w-4" />
              Expand
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(false)}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto rounded bg-gray-50 p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-900">
            {content}
          </pre>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>Updated Prompt</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(true)}
                className="flex items-center gap-1"
              >
                {modalCopied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto rounded bg-gray-50 p-6">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-900">
              {content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
