import { WalkthroughStep } from "../WalkthroughProvider";

export const dashboardSteps: WalkthroughStep[] = [
  {
    target: "",
    type: "info",
    title: "Welcome to PromptLab",
    description:
      "PromptLab helps you analyze and improve your AI prompts through systematic testing and iteration. Let's take a quick tour to get you started.",
  },
  {
    target: "help-button",
    type: "info",
    title: "Need Help?",
    description:
      "Click this button anytime you need help in any section. Now let's create your first prompt.",
  },
  {
    target: "new-prompt",
    type: "action",
    title: "Create a Prompt",
    description:
      "Click 'New Prompt' to start your prompt improvement journey. Think of prompts as folders that contain multiple iterations as you refine your AI instructions.",
  },
  {
    target: "prompt-create-button",
    highlightTarget: "prompt-dialog",
    type: "action",
    strictAction: true,
    title: "Name Your Prompt",
    description:
      "Enter a descriptive name like 'Customer Support Bot' or 'Email Writer', then click Create to continue.",
  },
  {
    target: "prompt-card",
    type: "action",
    title: "Open a Prompt",
    description:
      "Click on any prompt card to see all its iterations. From there, you can create new iterations or open existing ones in the editor.",
  },
];
