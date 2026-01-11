import { WalkthroughStep } from "../WalkthroughProvider";

export const iterationsSteps: WalkthroughStep[] = [
  {
    target: "",
    type: "info",
    title: "Your Iterations",
    description:
      "This is where you track your prompt improvement journey. Each iteration represents a version of your prompt that you've analyzed and refined.",
  },
  {
    target: "iteration-card",
    type: "info",
    title: "View an Iteration",
    description:
      "Each card shows an iteration's pass rate and improvement delta. Click any card to open it in the editor.",
  },
  {
    target: "new-iteration",
    type: "action",
    title: "Create New Iteration",
    description:
      "Click here to start a new iteration. We'll guide you through the process.",
  },
];
