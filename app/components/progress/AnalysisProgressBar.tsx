"use client";

import { useAnalysisProgress, AnalysisStep } from "@/lib/context/AnalysisProgressContext";

const stepLabels: Record<AnalysisStep, string> = {
  idle: "",
  analyzing: "Analyzing",
  generating: "Generating",
  complete: "Complete",
  error: "Error",
};

const stepColors: Record<AnalysisStep, string> = {
  idle: "bg-gray-200",
  analyzing: "bg-blue-500",
  generating: "bg-blue-500",
  complete: "bg-green-500",
  error: "bg-red-500",
};

export function AnalysisProgressBar() {
  const { progress } = useAnalysisProgress();

  if (progress.status === "idle") {
    return null;
  }

  const percentage = progress.status === "complete"
    ? 100
    : progress.status === "error"
    ? 100
    : (progress.step / progress.totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {stepLabels[progress.status]}
        </span>
        <span className="text-gray-500">{progress.message}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-500 ease-out ${stepColors[progress.status]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {progress.error && (
        <p className="text-sm text-red-600">{progress.error}</p>
      )}
    </div>
  );
}
