"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Check, X, Undo2, Maximize2, Copy } from "lucide-react";
import { scrollReveal } from "@/lib/animations/variants";

// Mock data matching actual editor UI
const mockCategories = [
  {
    name: "Instruction Following",
    severity: "high",
    count: "1 / 2",
    description:
      "The assistant failed to follow explicit system instructions to process refund requests politely",
    expanded: true,
    suggestions: [
      {
        type: "add",
        status: "draft", // accepted
        description:
          "Test 3 demonstrates the assistant saying 'Sorry, I cannot help with that' for refund requests, which directly violates the instruction to process refunds politely.",
        testCount: 1,
      },
      {
        type: "add",
        status: "rejected",
        description:
          "Test 3 shows the assistant completely refusing to help with refund requests instead of processing them.",
        testCount: 1,
      },
    ],
  },
  {
    name: "Tone Misalignment",
    severity: "high",
    count: "0 / 2",
    description:
      "The assistant's response is dismissive and unhelpful, contradicting the required professional tone",
    expanded: false,
    suggestions: [],
  },
  {
    name: "Missing Alternative Solutions",
    severity: "medium",
    count: "0 / 2",
    description:
      "When unable to fulfill a request, the assistant failed to offer alternatives",
    expanded: false,
    suggestions: [],
  },
];

// Original prompt lines with highlighting info
const originalPrompt = [
  { line: "You are a helpful customer service assistant", highlight: false },
  { line: "", highlight: false },
  { line: "Your role is to:", highlight: false },
  { line: "- Answer questions about products, orders, and returns", highlight: false },
  { line: "- Help customers track their orders", highlight: false },
  { line: "- Process refund requests politely by acknowledging...", highlight: false },
  { line: "", highlight: false },
  { line: "Always be professional and helpful. If you cannot...", highlight: "removed" },
];

// Modified prompt lines with highlighting info
const modifiedPrompt = [
  { line: "You are a helpful customer service assistant", highlight: false },
  { line: "", highlight: false },
  { line: "Your role is to:", highlight: false },
  { line: "- Answer questions about products, orders, and returns", highlight: false },
  { line: "- Help customers track their orders", highlight: false },
  { line: "- Process refund requests politely by acknowledging...", highlight: false },
  { line: "", highlight: false },
  { line: "Always be professional and helpful. If you cannot...", highlight: "added" },
  { line: "", highlight: false },
  { line: "Never give dismissive or curt responses - always...", highlight: "added" },
];

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${colors[severity as keyof typeof colors]}`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "draft") {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        Draft
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        Reject
      </span>
    );
  }
  return null;
}

function SuggestionCard({
  suggestion,
}: {
  suggestion: {
    type: string;
    status: string;
    description: string;
    testCount: number;
  };
}) {
  const isDraft = suggestion.status === "draft";
  const isRejected = suggestion.status === "rejected";

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white mt-2 ml-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isDraft ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : isRejected ? (
            <X className="w-4 h-4 text-red-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
          )}
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
            {suggestion.type}
          </span>
          <StatusBadge status={suggestion.status} />
        </div>
        <button
          className={`text-xs font-medium px-3 py-1 rounded border flex items-center gap-1 ${
            isDraft
              ? "text-green-600 border-green-200 hover:bg-green-50"
              : isRejected
                ? "text-red-500 border-red-200 hover:bg-red-50"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Undo2 className="w-3 h-3" />
          {isDraft ? "Unaccept" : isRejected ? "Unreject" : "Undo"}
        </button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{suggestion.description}</p>
      <p className="text-xs text-gray-400 mt-1">{suggestion.testCount} test(s)</p>
    </div>
  );
}

export function MockEditor() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" {...scrollReveal}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Evidence-Based Suggestions
          </h2>
          <p className="text-gray-600 text-lg">
            Every suggestion traces back to specific test failures.
          </p>
          <p className="text-gray-600 text-lg">
            Review changes side by side before applying.
          </p>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          {/* Editor mockup card */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Top bar with Apply button */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-end">
              <div className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                Apply 2 Change(s)
              </div>
            </div>

            {/* Test Results box */}
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-900">Test Results</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    Total: <span className="font-medium text-gray-900">3</span>
                  </span>
                  <span className="text-gray-500">
                    Passed:{" "}
                    <span className="font-medium text-green-600">2</span>
                  </span>
                  <span className="text-gray-500">
                    Failed: <span className="font-medium text-red-600">1</span>
                  </span>
                  <span className="text-gray-500">
                    Pass Rate:{" "}
                    <span className="font-medium text-blue-600">66.7%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">1 accepted</span>
                  <span className="text-gray-500">2 pending</span>
                  <span className="text-blue-600">0 applied</span>
                  <span className="text-red-500 font-medium">1 rejected</span>
                </div>
                <span className="text-sm text-gray-500">
                  2 change(s) will be applied: 1 accepted, 1 rejected.
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-5 min-h-[480px]">
              {/* Left panel - Failure Categories */}
              <div className="lg:col-span-2 border-r border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Failure Categories (3)
                </h4>

                <div className="space-y-3">
                  {mockCategories.map((category) => (
                    <div
                      key={category.name}
                      className={`rounded-lg border overflow-hidden ${
                        category.severity === "high"
                          ? "border-l-4 border-l-red-400 border-gray-200"
                          : "border-l-4 border-l-yellow-400 border-gray-200"
                      }`}
                    >
                      <div className="px-3 py-2.5 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {category.expanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900 text-sm">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={category.severity} />
                            <span className="text-xs text-gray-500">
                              {category.count}
                            </span>
                          </div>
                        </div>
                        {category.expanded && (
                          <>
                            <p className="text-xs text-gray-600 ml-6 mt-1">
                              {category.description}
                            </p>
                            {category.suggestions.map((suggestion, idx) => (
                              <SuggestionCard key={idx} suggestion={suggestion} />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel - Side by side view */}
              <div className="lg:col-span-3 p-4 flex flex-col">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Original
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs border border-gray-200 flex-1">
                      {originalPrompt.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex h-5 items-center ${
                            item.highlight === "removed" ? "bg-red-50" : ""
                          }`}
                        >
                          <span className="text-gray-400 w-6 text-right mr-3 select-none flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span
                            className={`truncate ${
                              item.highlight === "removed"
                                ? "text-red-700"
                                : "text-gray-700"
                            }`}
                          >
                            {item.line || "\u00A0"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Modified
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs border border-gray-200 flex-1">
                      {modifiedPrompt.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex h-5 items-center ${
                            item.highlight === "added" ? "bg-green-50" : ""
                          }`}
                        >
                          <span className="text-gray-400 w-6 text-right mr-3 select-none flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span
                            className={`truncate ${
                              item.highlight === "added"
                                ? "text-green-700"
                                : "text-gray-700"
                            }`}
                          >
                            {item.line || "\u00A0"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Updated Prompt Preview */}
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Updated Prompt Preview
                    </h4>
                    <div className="flex gap-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 border border-gray-200 rounded">
                        <Maximize2 className="w-3 h-3" />
                        Expand
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 border border-gray-200 rounded">
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="p-4 font-mono text-xs text-gray-700 max-h-24 overflow-hidden">
                    <p>
                      You are a helpful customer service assistant for an
                      e-commerce company. Your role is to: - Answer questions about
                      products, orders, and returns - Help customers track their
                      orders - Process refund requests politely by acknowledging...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
