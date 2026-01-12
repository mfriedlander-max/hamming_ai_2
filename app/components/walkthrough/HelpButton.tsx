"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useWalkthrough, WalkthroughSection } from "./WalkthroughProvider";
import { HelpCircle } from "lucide-react";

export function HelpButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startWalkthrough, isActive, currentStepTarget } = useWalkthrough();

  // Hide on landing page
  if (pathname === "/") return null;

  // Show the button if:
  // 1. Walkthrough is not active, OR
  // 2. Walkthrough is active and current step targets this button
  const isBeingHighlighted = isActive && currentStepTarget === "help-button";

  // Hide if walkthrough is active but not targeting this button
  if (isActive && !isBeingHighlighted) return null;

  // Determine current section based on pathname and query params
  const getSection = (): WalkthroughSection | null => {
    if (pathname === "/dashboard") {
      // Check if we're inside a prompt folder (iterations view)
      const folderId = searchParams.get("folder");
      return folderId ? "iterations" : "dashboard";
    }
    if (pathname?.startsWith("/projects/new")) return "newIteration";
    if (pathname?.match(/\/projects\/[^/]+\/editor/)) return "editor";
    return null;
  };

  const section = getSection();
  if (!section) return null;

  const handleClick = () => {
    // Don't allow clicks when being highlighted in the walkthrough
    if (isBeingHighlighted) return;
    startWalkthrough(section, false);
  };

  return (
    <button
      onClick={handleClick}
      data-tour="help-button"
      className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isBeingHighlighted
          ? "pointer-events-none"
          : "hover:bg-blue-700 hover:shadow-xl hover:scale-105"
      }`}
      aria-label="Start walkthrough tutorial"
    >
      <HelpCircle className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}
