"use client";

import { useAnalysisProgress } from "@/lib/context/AnalysisProgressContext";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function ProgressToast() {
  const { progress, reset } = useAnalysisProgress();

  if (progress.status === "idle") {
    return null;
  }

  const isComplete = progress.status === "complete";
  const isError = progress.status === "error";
  const isProcessing = !isComplete && !isError;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
      <div
        className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${
          isError
            ? "bg-red-50 border border-red-200"
            : isComplete
            ? "bg-green-50 border border-green-200"
            : "bg-white border border-gray-200"
        }`}
      >
        {isProcessing && (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        )}
        {isComplete && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {isError && (
          <XCircle className="h-5 w-5 text-red-500" />
        )}

        <div className="flex flex-col">
          <span
            className={`text-sm font-medium ${
              isError
                ? "text-red-900"
                : isComplete
                ? "text-green-900"
                : "text-gray-900"
            }`}
          >
            {progress.message}
          </span>
          {progress.error && (
            <span className="text-xs text-red-600">{progress.error}</span>
          )}
        </div>

        {(isComplete || isError) && (
          <button
            onClick={reset}
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
