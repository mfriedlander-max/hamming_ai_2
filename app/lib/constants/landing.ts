// All landing page content in one place for easy updates and future i18n

export const LANDING_CONTENT = {
  hero: {
    headline: "Improve Your Prompts",
    headlineAccent: "With Evidence",
    subheadline:
      "Test your AI prompts at scale. Get precise improvement suggestions backed by real data. Every edit traced, every change justified.",
    primaryCTA: "Analyze a Test Batch",
    primaryCTAHref: "/projects/new",
    secondaryCTA: "View Dashboard",
    secondaryCTAHref: "/dashboard",
  },

  productIntro: {
    heading: "AI Prompt Engineering, Powered by Evidence",
    description:
      "PromptLab helps AI teams systematically improve their prompts through rigorous testing. Upload test cases, analyze results against your system prompts, and receive targeted suggestions that you can trace back to specific evidence.",
  },

  features: {
    heading: "Everything You Need for Better Prompts",
    items: [
      {
        icon: "Search",
        title: "Evidence-Based Analysis",
        description:
          "Every suggestion traces back to specific test cases. No guesswork, just data.",
      },
      {
        icon: "Target",
        title: "Minimal Edits",
        description:
          "Get precise, surgical improvements. We suggest only what needs to change.",
      },
      {
        icon: "Link",
        title: "Full Traceability",
        description:
          "Track every change from suggestion to implementation. Complete audit trail.",
      },
    ],
  },

  howItWorks: {
    heading: "Simple Workflow, Powerful Results",
    steps: [
      {
        number: 1,
        icon: "Upload",
        title: "Upload Your Test Batch",
        description: "CSV, JSON, or Excel files supported",
      },
      {
        number: 2,
        icon: "Settings",
        title: "Run Analysis",
        description: "AI compares outputs against your system prompt",
      },
      {
        number: 3,
        icon: "CheckCircle",
        title: "Review & Apply Suggestions",
        description: "Each suggestion linked to evidence, ready to implement",
      },
    ],
  },

  useCases: {
    heading: "Built for AI Teams",
    items: [
      {
        icon: "Layers",
        title: "Product Teams",
        description: "Validate prompt changes before production deployment",
      },
      {
        icon: "Code",
        title: "AI Engineers",
        description: "Debug and optimize LLM behavior systematically",
      },
      {
        icon: "Shield",
        title: "QA Teams",
        description: "Regression test prompts with real data",
      },
      {
        icon: "FlaskConical",
        title: "Researchers",
        description: "Document and iterate on prompt engineering experiments",
      },
    ],
  },

  finalCTA: {
    heading: "Start Improving Your Prompts Today",
    subheading: "No credit card required. Analyze your first batch in minutes.",
    buttonText: "Analyze a Test Batch",
    buttonHref: "/projects/new",
  },
};
