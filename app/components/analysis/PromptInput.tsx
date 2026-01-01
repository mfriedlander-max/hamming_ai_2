"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="system-prompt" className="text-base font-semibold">
        System Prompt
      </Label>
      <Textarea
        id="system-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your current system prompt here..."
        className="min-h-[200px] font-mono text-sm"
        aria-describedby="system-prompt-help"
      />
      <p id="system-prompt-help" className="text-xs text-gray-500">
        This is the prompt you want to analyze and improve
      </p>
    </div>
  );
}
