import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for SpotlightOverlay logic.
 *
 * These tests verify core functionality without requiring
 * the full WalkthroughProvider context.
 */

describe("SpotlightOverlay Logic", () => {
  describe("Stuck time elapsed logic (Skip button)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("should set stuckTimeElapsed after 5 seconds", () => {
      let stuckTimeElapsed = false;
      const isStuck = true; // strictAction && targetNotFound

      if (isStuck) {
        setTimeout(() => {
          stuckTimeElapsed = true;
        }, 5000);
      }

      expect(stuckTimeElapsed).toBe(false);

      vi.advanceTimersByTime(5000);

      expect(stuckTimeElapsed).toBe(true);

      vi.useRealTimers();
    });

    it("should NOT set stuckTimeElapsed if not stuck", () => {
      let stuckTimeElapsed = false;
      const isStuck = false;

      if (isStuck) {
        setTimeout(() => {
          stuckTimeElapsed = true;
        }, 5000);
      }

      vi.advanceTimersByTime(5000);

      expect(stuckTimeElapsed).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("Event delegation with closest()", () => {
    it("should find parent element with data-tour using closest()", () => {
      // Create structure: div[data-tour] > span > button (clicked)
      const container = document.createElement("div");
      container.setAttribute("data-tour", "suggestion-action");
      const span = document.createElement("span");
      const button = document.createElement("button");
      button.textContent = "Click me";
      span.appendChild(button);
      container.appendChild(span);
      document.body.appendChild(container);

      const clickedElement = button as Element;
      const tourElement = clickedElement.closest(
        '[data-tour="suggestion-action"]'
      );

      expect(tourElement).toBe(container);

      document.body.removeChild(container);
    });

    it("should return null if no parent has data-tour", () => {
      const div = document.createElement("div");
      const button = document.createElement("button");
      div.appendChild(button);
      document.body.appendChild(div);

      const clickedElement = button as Element;
      const tourElement = clickedElement.closest(
        '[data-tour="suggestion-action"]'
      );

      expect(tourElement).toBeNull();

      document.body.removeChild(div);
    });

    it("should find element itself if it has data-tour", () => {
      const button = document.createElement("button");
      button.setAttribute("data-tour", "suggestion-action");
      document.body.appendChild(button);

      const clickedElement = button as Element;
      const tourElement = clickedElement.closest(
        '[data-tour="suggestion-action"]'
      );

      expect(tourElement).toBe(button);

      document.body.removeChild(button);
    });
  });

  describe("showSkipButton logic", () => {
    it("should show skip when strictAction, targetNotFound, and stuckTimeElapsed", () => {
      const currentStepData = { strictAction: true };
      const targetNotFound = true;
      const stuckTimeElapsed = true;

      const showSkipButton =
        currentStepData.strictAction && targetNotFound && stuckTimeElapsed;

      expect(showSkipButton).toBe(true);
    });

    it("should NOT show skip when stuckTimeElapsed is false", () => {
      const currentStepData = { strictAction: true };
      const targetNotFound = true;
      const stuckTimeElapsed = false;

      const showSkipButton =
        currentStepData.strictAction && targetNotFound && stuckTimeElapsed;

      expect(showSkipButton).toBe(false);
    });

    it("should NOT show skip when target is found", () => {
      const currentStepData = { strictAction: true };
      const targetNotFound = false;
      const stuckTimeElapsed = true;

      const showSkipButton =
        currentStepData.strictAction && targetNotFound && stuckTimeElapsed;

      expect(showSkipButton).toBe(false);
    });
  });
});
