"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type WalkthroughSection = "dashboard" | "iterations" | "newIteration" | "editor";

export type WalkthroughStepType = "action" | "info";

export interface WalkthroughStep {
  target: string; // data-tour attribute value or "" for center overlay
  type: WalkthroughStepType; // "action" = click element to advance, "info" = Continue button
  title: string;
  description: string;
  highlightTarget?: string; // Optional: element to highlight (blue ring) if different from target
}

interface WalkthroughContextType {
  isActive: boolean;
  currentSection: WalkthroughSection | null;
  currentStep: number;
  currentStepTarget: string | null;
  hasSeenFullTour: boolean;
  isFullTour: boolean;
  startWalkthrough: (section: WalkthroughSection, fullTour?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  dismiss: () => void;
  getCurrentSteps: () => WalkthroughStep[];
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

const STORAGE_KEY = "promptlab_walkthrough_completed";

// Section order for full tour flow
const SECTION_ORDER: WalkthroughSection[] = ["dashboard", "iterations", "newIteration", "editor"];

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isActive, setIsActive] = useState(false);
  const [currentSection, setCurrentSection] = useState<WalkthroughSection | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenFullTour, setHasSeenFullTour] = useState(true); // Default true, check localStorage
  const [isFullTour, setIsFullTour] = useState(false);
  const [steps, setSteps] = useState<Record<WalkthroughSection, WalkthroughStep[]>>({
    dashboard: [],
    iterations: [],
    newIteration: [],
    editor: [],
  });

  // Load steps dynamically
  useEffect(() => {
    async function loadSteps() {
      const [dashboardSteps, iterationsSteps, newIterationSteps, editorSteps] = await Promise.all([
        import("./steps/dashboard").then((m) => m.dashboardSteps),
        import("./steps/iterations").then((m) => m.iterationsSteps),
        import("./steps/newIteration").then((m) => m.newIterationSteps),
        import("./steps/editor").then((m) => m.editorSteps),
      ]);
      setSteps({
        dashboard: dashboardSteps,
        iterations: iterationsSteps,
        newIteration: newIterationSteps,
        editor: editorSteps,
      });
    }
    loadSteps();
  }, []);

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    setHasSeenFullTour(completed === "true");
  }, []);

  // Auto-start full tour for first-time users on dashboard
  useEffect(() => {
    if (
      !hasSeenFullTour &&
      pathname === "/dashboard" &&
      !isActive &&
      steps.dashboard.length > 0
    ) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        startWalkthrough("dashboard", true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenFullTour, pathname, isActive, steps.dashboard.length]);

  // Helper to detect current section from URL
  const detectSectionFromUrl = useCallback((): WalkthroughSection | null => {
    if (pathname === "/dashboard") {
      // Check if we're inside a prompt folder (iterations view)
      const folderId = searchParams.get("folder");
      return folderId ? "iterations" : "dashboard";
    }
    if (pathname?.startsWith("/projects/new")) return "newIteration";
    if (pathname?.match(/\/projects\/[^/]+\/editor/)) return "editor";
    return null;
  }, [pathname, searchParams]);

  // Detect section changes during full tour and continue
  useEffect(() => {
    if (!isFullTour || !isActive) return;

    const detectedSection = detectSectionFromUrl();

    // If we've navigated to a new section during full tour, continue there
    if (detectedSection && detectedSection !== currentSection) {
      setCurrentSection(detectedSection);
      setCurrentStep(0);
    }
  }, [pathname, searchParams, isFullTour, isActive, currentSection, detectSectionFromUrl]);

  // Dismiss walkthrough when URL changes unexpectedly (e.g., clicking prompt card during last step)
  useEffect(() => {
    if (!isActive) return;

    const detectedSection = detectSectionFromUrl();

    // If the current section doesn't match where we are, dismiss the walkthrough
    // This handles cases like navigating away via a link during the walkthrough
    if (detectedSection !== currentSection && !isFullTour) {
      // For non-full-tour, just dismiss
      setIsActive(false);
      setCurrentSection(null);
      setCurrentStep(0);
    }
  }, [pathname, searchParams, isActive, currentSection, isFullTour, detectSectionFromUrl]);

  const startWalkthrough = useCallback(
    (section: WalkthroughSection, fullTour = false) => {
      setCurrentSection(section);
      setCurrentStep(0);
      setIsActive(true);
      setIsFullTour(fullTour);
    },
    []
  );

  const getCurrentSteps = useCallback((): WalkthroughStep[] => {
    if (!currentSection) return [];
    return steps[currentSection] || [];
  }, [currentSection, steps]);

  const nextStep = useCallback(() => {
    const currentSteps = getCurrentSteps();
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (isFullTour) {
      // Move to next section in full tour
      const currentIndex = SECTION_ORDER.indexOf(currentSection!);
      if (currentIndex < SECTION_ORDER.length - 1) {
        // There's a next section, but we wait for navigation to trigger it
        // For now, just complete this section
        setIsActive(false);
        setCurrentSection(null);
        setCurrentStep(0);
      } else {
        // Full tour complete
        markTourComplete();
      }
    } else {
      // Section complete
      dismiss();
    }
  }, [currentStep, getCurrentSteps, isFullTour, currentSection]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const markTourComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasSeenFullTour(true);
    setIsActive(false);
    setCurrentSection(null);
    setCurrentStep(0);
    setIsFullTour(false);
  }, []);

  const dismiss = useCallback(() => {
    if (isFullTour) {
      // Mark as seen so it doesn't auto-start again
      markTourComplete();
    } else {
      setIsActive(false);
      setCurrentSection(null);
      setCurrentStep(0);
    }
  }, [isFullTour, markTourComplete]);

  // Compute current step target for external components (like HelpButton)
  const currentStepTarget = isActive && currentSection
    ? steps[currentSection]?.[currentStep]?.target ?? null
    : null;

  return (
    <WalkthroughContext.Provider
      value={{
        isActive,
        currentSection,
        currentStep,
        currentStepTarget,
        hasSeenFullTour,
        isFullTour,
        startWalkthrough,
        nextStep,
        prevStep,
        dismiss,
        getCurrentSteps,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error("useWalkthrough must be used within a WalkthroughProvider");
  }
  return context;
}
