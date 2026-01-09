"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AnalysisStep = "idle" | "analyzing" | "generating" | "complete" | "error";

export interface AnalysisProgress {
  status: AnalysisStep;
  step: number;
  totalSteps: number;
  message: string;
  error?: string;
  projectId?: string;
}

interface AnalysisProgressContextType {
  progress: AnalysisProgress;
  startAnalysis: (projectId: string) => void;
  setAnalyzing: () => void;
  setGenerating: (current: number, total: number) => void;
  setComplete: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialProgress: AnalysisProgress = {
  status: "idle",
  step: 0,
  totalSteps: 2,
  message: "",
};

const AnalysisProgressContext = createContext<AnalysisProgressContextType | null>(null);

export function AnalysisProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<AnalysisProgress>(initialProgress);

  const startAnalysis = useCallback((projectId: string) => {
    setProgress({
      status: "analyzing",
      step: 1,
      totalSteps: 2,
      message: "Starting analysis...",
      projectId,
    });
  }, []);

  const setAnalyzing = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      status: "analyzing",
      step: 1,
      message: "Analyzing test failures...",
    }));
  }, []);

  const setGenerating = useCallback((current: number, total: number) => {
    setProgress((prev) => ({
      ...prev,
      status: "generating",
      step: 2,
      totalSteps: 2,
      message: `Generating suggestions (${current}/${total} categories)...`,
    }));
  }, []);

  const setComplete = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      status: "complete",
      step: 2,
      message: "Analysis complete!",
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setProgress((prev) => ({
      ...prev,
      status: "error",
      error,
      message: "Analysis failed",
    }));
  }, []);

  const reset = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  return (
    <AnalysisProgressContext.Provider
      value={{
        progress,
        startAnalysis,
        setAnalyzing,
        setGenerating,
        setComplete,
        setError,
        reset,
      }}
    >
      {children}
    </AnalysisProgressContext.Provider>
  );
}

export function useAnalysisProgress() {
  const context = useContext(AnalysisProgressContext);
  if (!context) {
    throw new Error("useAnalysisProgress must be used within AnalysisProgressProvider");
  }
  return context;
}
