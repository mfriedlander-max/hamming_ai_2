import { WalkthroughStep } from "../WalkthroughProvider";

export const editorSteps: WalkthroughStep[] = [
  {
    target: "",
    type: "info",
    title: "The Prompt Editor",
    description:
      "Welcome to the editor! Here you'll review AI-generated suggestions and apply changes to improve your prompt.",
  },
  {
    target: "suggestions-panel",
    type: "info",
    title: "Suggestions Panel",
    description:
      "Here you'll find AI-generated suggestions organized by category. Each suggestion targets a specific issue found in your test results.",
  },
  {
    target: "failure-category",
    type: "action",
    title: "Explore a Category",
    description:
      "Click on a failure category to see its suggestions.",
  },
  {
    target: "suggestion-action",
    highlightTarget: "suggestion-card",
    type: "action",
    title: "Accept or Reject",
    description:
      "Accept suggestions you agree with, or reject ones you don't. Click any action button to continue.",
  },
  {
    target: "diff-viewer",
    type: "info",
    title: "See the Changes",
    description:
      "The diff viewer shows exactly how your prompt will change. Green highlights additions, red highlights removals.",
  },
  {
    target: "apply-changes",
    type: "action",
    title: "Apply Changes",
    description:
      "Click Apply to save your changes. This completes the editor walkthrough!",
  },
];
