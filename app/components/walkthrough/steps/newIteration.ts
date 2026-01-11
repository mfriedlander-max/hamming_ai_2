import { WalkthroughStep } from "../WalkthroughProvider";

export const newIterationSteps: WalkthroughStep[] = [
  {
    target: "",
    type: "info",
    title: "Create an Iteration",
    description:
      "Let's walk through creating your first iteration. You'll provide a name, upload test cases, and enter your system prompt.",
  },
  {
    target: "iteration-name",
    type: "info",
    title: "Name Your Iteration",
    description:
      "Give your iteration a meaningful name to help you track changes. Names auto-generate as 'Iteration 1', 'Iteration 2', etc., but you can customize them.",
  },
  {
    target: "test-batch-upload",
    type: "info",
    title: "Upload Your Test Batch",
    description:
      "Upload a JSON or CSV file containing test cases. Each test case should have inputs and expected outputs to evaluate your prompt's performance.",
  },
  {
    target: "system-prompt",
    type: "info",
    title: "Your System Prompt",
    description:
      "Enter the system prompt you want to analyze and improve. You can also continue from a previous iteration's prompt if you're refining an existing one.",
  },
  {
    target: "create-analyze",
    type: "action",
    title: "Ready to Analyze",
    description:
      "Click to start analysis. We'll guide you through the editor next.",
  },
];
