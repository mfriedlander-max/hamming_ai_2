"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  Eye,
  CheckCircle,
  FileJson,
  Loader2,
  Check,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Add your test batch with expected vs actual outputs",
  },
  {
    number: "02",
    title: "Analyze",
    description: "AI identifies failure patterns in your outputs",
  },
  {
    number: "03",
    title: "Review",
    description: "Check suggestions linked to specific failures",
  },
  {
    number: "04",
    title: "Apply",
    description: "Update your prompt with one click",
  },
];

// Visual components for each step
function UploadVisual() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <FileJson className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">test-batch.json</p>
          <p className="text-sm text-gray-500">5 test cases</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Uploading...</span>
          <span className="text-blue-600 font-medium">75%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          <span className="text-green-600 font-medium">5 test cases</span> ready
          to analyze
        </p>
      </div>
    </div>
  );
}

function AnalyzeVisual() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-lg">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-gray-700 font-medium">Analyzing outputs...</span>
      </div>
      <div className="space-y-3">
        <motion.div
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm text-gray-700">Instruction Following</span>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
            HIGH
          </span>
        </motion.div>
        <motion.div
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-sm text-gray-700">Tone Misalignment</span>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
            HIGH
          </span>
        </motion.div>
        <motion.div
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-sm text-gray-700">Missing Alternatives</span>
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
            MEDIUM
          </span>
        </motion.div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
        Found <span className="font-medium text-gray-900">3 categories</span> of
        failures
      </div>
    </div>
  );
}

function ReviewVisual() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-lg">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Failure Categories (3)
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="border-l-4 border-red-400 bg-red-50/50 rounded-r-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-900 text-sm">
              Instruction Following
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
              high
            </span>
          </div>
          <p className="text-xs text-gray-600">
            The assistant failed to follow explicit system instructions...
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-gray-500">2 suggestions</span>
          </div>
        </div>
        <div className="border-l-4 border-yellow-400 bg-yellow-50/50 rounded-r-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-900 text-sm">
              Missing Alternatives
            </span>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
              medium
            </span>
          </div>
          <p className="text-xs text-gray-600">
            When unable to fulfill a request, failed to offer alternatives...
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplyVisual() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-lg">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Preview Changes
        </span>
        <span className="text-xs text-gray-500">Original → Modified</span>
      </div>
      <div className="p-4 font-mono text-xs space-y-1">
        <div className="bg-red-50 text-red-800 px-2 py-1 rounded">
          <span className="text-red-400 mr-2">-</span>
          Be concise.
        </div>
        <div className="bg-green-50 text-green-800 px-2 py-1 rounded">
          <span className="text-green-400 mr-2">+</span>
          Be concise and empathetic.
        </div>
        <div className="h-2" />
        <div className="bg-red-50 text-red-800 px-2 py-1 rounded">
          <span className="text-red-400 mr-2">-</span>
          Answer questions directly.
        </div>
        <div className="bg-green-50 text-green-800 px-2 py-1 rounded">
          <span className="text-green-400 mr-2">+</span>
          Answer questions directly, offering alternatives when needed.
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">
            2 changes ready
          </span>
        </div>
        <div className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg">
          Apply Changes
        </div>
      </div>
    </div>
  );
}

const visuals = [UploadVisual, AnalyzeVisual, ReviewVisual, ApplyVisual];
const icons = [Upload, Sparkles, Eye, CheckCircle];

export function WorkflowSteps() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            From Prompt Failures to Improvements in 4 Easy Steps
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your test results, let AI analyze failures, review
            suggestions, and apply fixes with one click.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left: Steps */}
          <div className="space-y-2">
            {steps.map((step, index) => {
              const Icon = icons[index];
              const isActive = activeStep === index;

              return (
                <motion.button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    isActive
                      ? "bg-white shadow-md border-l-4 border-blue-600"
                      : "hover:bg-white/50 border-l-4 border-transparent"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`text-2xl font-bold ${isActive ? "text-blue-600" : "text-gray-300"}`}
                    >
                      {step.number}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                        />
                        <span
                          className={`font-semibold ${isActive ? "text-blue-600" : "text-gray-700"}`}
                        >
                          {step.title}
                        </span>
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-gray-600 text-sm"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Visual */}
          <div className="flex items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                {visuals[activeStep]()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
