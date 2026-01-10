"use client";

import { motion } from "framer-motion";
import { ChevronDown, Check, X } from "lucide-react";
import { scrollReveal } from "@/lib/animations/variants";

// Mock data for the editor visualization
const mockCategories = [
  {
    name: "Vague Instructions",
    severity: "high",
    count: 2,
    expanded: true,
    suggestions: [
      { text: "Add specific format requirements", status: "accepted" },
      { text: "Define response length constraints", status: "pending" },
    ],
  },
  {
    name: "Missing Context",
    severity: "medium",
    count: 1,
    expanded: false,
    suggestions: [{ text: "Include user role context", status: "accepted" }],
  },
];

const mockDiff = [
  { type: "context", text: "You are a helpful assistant." },
  { type: "removed", text: "Answer questions clearly." },
  {
    type: "added",
    text: "Answer questions in 2-3 sentences, using bullet points for lists.",
  },
  { type: "context", text: "" },
  { type: "removed", text: "Be concise." },
  {
    type: "added",
    text: "Keep responses under 150 words unless the user requests more detail.",
  },
];

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[severity as keyof typeof colors]}`}
    >
      {severity}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="w-2.5 h-2.5 text-green-600" />
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
        <X className="w-2.5 h-2.5 text-red-600" />
      </div>
    );
  }
  return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
}

export function MockEditor() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" {...scrollReveal}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Evidence-Based Suggestions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every suggestion traces back to specific test failures. Review
            changes side-by-side before applying.
          </p>
        </motion.div>

        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          {/* Editor mockup card */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Top bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-sm text-gray-500 ml-2">
                PromptLab Editor
              </span>
            </div>

            {/* Main content */}
            <div className="grid md:grid-cols-5 min-h-[400px]">
              {/* Left panel - Suggestions */}
              <div className="md:col-span-2 border-r border-gray-200 p-4 bg-gray-50/50">
                {/* Status summary */}
                <div className="flex gap-3 text-xs mb-4 pb-3 border-b border-gray-200">
                  <span className="text-green-600 font-medium">2 accepted</span>
                  <span className="text-gray-500">1 pending</span>
                  <span className="text-blue-600">0 applied</span>
                </div>

                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Failure Categories
                </h4>

                {/* Categories */}
                <div className="space-y-2">
                  {mockCategories.map((category) => (
                    <div
                      key={category.name}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${!category.expanded ? "-rotate-90" : ""}`}
                          />
                          <span className="text-sm font-medium text-gray-700">
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
                        <div className="border-t border-gray-100 px-3 py-2 space-y-2">
                          {category.suggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <StatusIcon status={suggestion.status} />
                              <span className="text-gray-600">
                                {suggestion.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel - Diff view */}
              <div className="md:col-span-3 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Preview Changes
                </h4>

                <div className="font-mono text-sm space-y-0.5">
                  {mockDiff.map((line, idx) => {
                    if (line.type === "removed") {
                      return (
                        <div
                          key={idx}
                          className="bg-red-50 text-red-800 px-2 py-1 rounded-sm"
                        >
                          <span className="text-red-400 mr-2">-</span>
                          {line.text}
                        </div>
                      );
                    }
                    if (line.type === "added") {
                      return (
                        <div
                          key={idx}
                          className="bg-green-50 text-green-800 px-2 py-1 rounded-sm"
                        >
                          <span className="text-green-400 mr-2">+</span>
                          {line.text}
                        </div>
                      );
                    }
                    if (line.text === "") {
                      return <div key={idx} className="h-4" />;
                    }
                    return (
                      <div key={idx} className="text-gray-600 px-2 py-1">
                        <span className="text-gray-300 mr-2">&nbsp;</span>
                        {line.text}
                      </div>
                    );
                  })}
                </div>

                {/* Apply button */}
                <div className="mt-6 flex justify-end">
                  <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                    Apply 2 Changes
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
