"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";

interface ExportDialogProps {
  onExport: (format: "txt" | "md" | "json") => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  formats?: Array<"txt" | "md" | "json">;
}

export function ExportDialog({
  onExport,
  trigger,
  title = "Export",
  description = "Choose a format to export",
  formats = ["txt", "md", "json"],
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<"txt" | "md" | "json">(
    formats[0]
  );
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    onExport(selectedFormat);
    setOpen(false);
  };

  const formatLabels = {
    txt: "Plain Text (.txt)",
    md: "Markdown (.md)",
    json: "JSON (.json)",
  };

  const formatDescriptions = {
    txt: "Simple text file for easy copying",
    md: "Markdown format with formatting preserved",
    json: "Structured data for programmatic use",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedFormat}
            onValueChange={setSelectedFormat as (value: string) => void}
          >
            <div className="space-y-3">
              {formats.map((format) => (
                <div key={format} className="flex items-start space-x-3">
                  <RadioGroupItem value={format} id={format} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={format} className="font-medium">
                      {formatLabels[format]}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {formatDescriptions[format]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
