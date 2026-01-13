"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useWalkthrough } from "./WalkthroughProvider";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightOverlay() {
  const {
    isActive,
    currentStep,
    nextStep,
    dismiss,
    getCurrentSteps,
    isFullTour,
  } = useWalkthrough();

  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom" | "left" | "right" | "center";
  } | null>(null);
  const [targetNotFound, setTargetNotFound] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const clickHandlerRef = useRef<(() => void) | null>(null);
  const lastStepRef = useRef<number>(-1);

  const steps = getCurrentSteps();
  const currentStepData = steps[currentStep];

  // Determine if this step should show a Continue button
  // Info steps always show Continue, action steps show Continue only if target not found (unless strictAction)
  const showContinueButton = currentStepData?.type === "info" || (targetNotFound && !currentStepData?.strictAction);
  const isLastStep = currentStep === steps.length - 1;

  // Find target element and calculate spotlight position
  const updateSpotlight = useCallback((skipScroll = false) => {
    if (!currentStepData) return;

    if (!currentStepData.target) {
      // Center overlay (no target) - intro step
      setSpotlightRect(null);
      setTargetNotFound(false);
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: "center",
      });
      return;
    }

    // Use highlightTarget for the visual highlight, fall back to target
    const highlightSelector = currentStepData.highlightTarget || currentStepData.target;
    const highlightElement = document.querySelector(`[data-tour="${highlightSelector}"]`);

    // Also check if the click target exists (for action steps)
    const clickTarget = document.querySelector(`[data-tour="${currentStepData.target}"]`);

    if (!highlightElement && !clickTarget) {
      // Neither target found - center the tooltip and show Continue (or wait for target to appear)
      setSpotlightRect(null);
      setTargetNotFound(true);
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: "center",
      });
      return;
    }

    // For action steps: if click target is not found or is disabled, show Continue button
    // (even if highlight target exists - we can't advance without a clickable target)
    const isTargetDisabled = clickTarget instanceof HTMLButtonElement && clickTarget.disabled;
    const actionTargetMissing = currentStepData.type === "action" && (!clickTarget || isTargetDisabled);
    setTargetNotFound(actionTargetMissing);

    // Use the highlight element for visual positioning, or fall back to click target
    const targetElement = highlightElement || clickTarget;

    // Scroll into view smoothly if this is a new step
    const isNewStep = lastStepRef.current !== currentStep;
    if (isNewStep && !skipScroll && targetElement) {
      lastStepRef.current = currentStep;
      setHasScrolled(false);

      // Check if element is in viewport
      const rect = targetElement.getBoundingClientRect();
      const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isInViewport) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        // Wait for scroll to complete, then recalculate position
        setTimeout(() => {
          setHasScrolled(true);
          updateSpotlight(true); // Call again with skipScroll to recalculate after scroll
        }, 350);
        return;
      }
    }

    const rect = targetElement!.getBoundingClientRect();
    const padding = 8;

    const spotlight = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    setSpotlightRect(spotlight);

    // Calculate tooltip position
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const margin = 16;

    let placement: "top" | "bottom" | "left" | "right" = "bottom";
    let top = spotlight.top + spotlight.height + margin;
    let left = spotlight.left + spotlight.width / 2;

    // Check if tooltip fits below
    if (top + tooltipHeight > window.innerHeight - margin) {
      // Try above
      if (spotlight.top - tooltipHeight - margin > margin) {
        placement = "top";
        top = spotlight.top - margin;
      } else {
        // Try right
        if (spotlight.left + spotlight.width + tooltipWidth + margin < window.innerWidth) {
          placement = "right";
          top = spotlight.top + spotlight.height / 2;
          left = spotlight.left + spotlight.width + margin;
        } else {
          // Try left
          placement = "left";
          top = spotlight.top + spotlight.height / 2;
          left = spotlight.left - margin;
        }
      }
    }

    // Ensure tooltip stays within viewport horizontally
    if (placement === "bottom" || placement === "top") {
      left = Math.max(tooltipWidth / 2 + margin, Math.min(left, window.innerWidth - tooltipWidth / 2 - margin));
    }

    setTooltipPosition({ top, left, placement });
  }, [currentStepData, currentStep]);

  // Set up click handler for action steps
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Only set up click handler for action steps with a valid target
    if (currentStepData.type !== "action" || !currentStepData.target || targetNotFound) {
      clickHandlerRef.current = null;
      return;
    }

    // Find all elements with the target data-tour attribute
    // This handles cases like suggestion-action where both Accept and Reject buttons have the same attribute
    const targets = document.querySelectorAll(`[data-tour="${currentStepData.target}"]`);
    if (targets.length === 0) return;

    const handleClick = () => {
      // Advance to next step when any target element is clicked
      nextStep();
    };

    // Store reference for cleanup
    clickHandlerRef.current = handleClick;

    // Add click listener to all matching elements
    targets.forEach(target => {
      target.addEventListener("click", handleClick, { capture: true });
    });

    return () => {
      targets.forEach(target => {
        target.removeEventListener("click", handleClick, { capture: true });
      });
      clickHandlerRef.current = null;
    };
  }, [isActive, currentStepData, targetNotFound, nextStep]);

  // Update spotlight on step change and window resize
  useEffect(() => {
    if (!isActive) return;

    updateSpotlight();

    // Retry after a short delay to catch DOM updates (e.g., when data-tour attribute moves)
    const retryTimeout = setTimeout(() => updateSpotlight(), 100);

    const handleResize = () => updateSpotlight();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    // Retry finding target element AND waiting for it to become enabled
    // (for dynamically rendered elements like dialogs, and buttons that start disabled)
    let retryInterval: NodeJS.Timeout | null = null;
    if (currentStepData?.target && targetNotFound) {
      retryInterval = setInterval(() => {
        const target = document.querySelector(`[data-tour="${currentStepData.target}"]`);
        if (target) {
          // Check if button is now enabled (if it's a button)
          const isDisabled = target instanceof HTMLButtonElement && target.disabled;
          if (!isDisabled) {
            updateSpotlight();
            if (retryInterval) clearInterval(retryInterval);
          }
        }
      }, 200);
    }

    return () => {
      clearTimeout(retryTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [isActive, updateSpotlight, currentStepData, targetNotFound]);

  // Handle escape key
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      } else if ((e.key === "ArrowRight" || e.key === "Enter") && showContinueButton) {
        nextStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, dismiss, nextStep, showContinueButton]);

  if (!isActive || !currentStepData) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only dismiss if clicking the overlay itself, not the tooltip
    if (e.target === e.currentTarget) {
      dismiss();
    }
  };

  const getTooltipStyles = (): React.CSSProperties => {
    if (!tooltipPosition) return {};

    const base: React.CSSProperties = {
      position: "fixed",
      zIndex: 10002,
      width: 320,
      transition: "top 300ms ease-out, left 300ms ease-out, bottom 300ms ease-out, right 300ms ease-out, transform 300ms ease-out",
    };

    if (tooltipPosition.placement === "center") {
      return {
        ...base,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    switch (tooltipPosition.placement) {
      case "bottom":
        return {
          ...base,
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          ...base,
          bottom: window.innerHeight - tooltipPosition.top,
          left: tooltipPosition.left,
          transform: "translateX(-50%)",
        };
      case "right":
        return {
          ...base,
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          ...base,
          top: tooltipPosition.top,
          right: window.innerWidth - tooltipPosition.left,
          transform: "translateY(-50%)",
        };
      default:
        return base;
    }
  };

  const getButtonLabel = () => {
    if (isLastStep) {
      return isFullTour ? "Continue" : "Got it";
    }
    return "Continue";
  };

  // Create a hole in the overlay for any step with a spotlight target
  const getOverlayClipPath = (): string | undefined => {
    if (!spotlightRect) {
      return undefined;
    }
    // Create a polygon that covers the entire viewport except the spotlight area
    const { top, left, width, height } = spotlightRect;
    const right = left + width;
    const bottom = top + height;
    // Polygon: outer rectangle (clockwise) then inner rectangle (counter-clockwise)
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px
    )`;
  };

  return (
    <>
      {/* Light semi-transparent overlay - with hole for highlighted targets */}
      <div
        className="fixed inset-0 z-[10000] bg-black/30 transition-all duration-300"
        onClick={handleOverlayClick}
        style={{
          clipPath: getOverlayClipPath(),
        }}
      />

      {/* Blue outline ring around target */}
      {spotlightRect && (
        <div
          className="fixed z-[10001] rounded-lg ring-2 ring-blue-500 ring-offset-4 ring-offset-white transition-all duration-300 pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="bg-white rounded-xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={getTooltipStyles()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close walkthrough"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Progress and navigation */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-blue-600"
                    : index < currentStep
                    ? "bg-blue-300"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Continue button - only for info steps or when target not found */}
          {showContinueButton && (
            <Button size="sm" onClick={nextStep}>
              {getButtonLabel()}
            </Button>
          )}
        </div>

        {/* Skip tour link */}
        <button
          onClick={dismiss}
          className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip tour
        </button>
      </div>
    </>
  );
}
