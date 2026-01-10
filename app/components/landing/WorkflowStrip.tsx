"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, Eye, CheckCircle } from "lucide-react";
import { scrollReveal } from "@/lib/animations/variants";

const steps = [
  { icon: Upload, label: "Upload", description: "Add test batch" },
  { icon: Sparkles, label: "Analyze", description: "AI reviews outputs" },
  { icon: Eye, label: "Review", description: "Check suggestions" },
  { icon: CheckCircle, label: "Apply", description: "Update prompt" },
];

export function WorkflowStrip() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center"
          {...scrollReveal}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-12 text-center">
            How It Works
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 w-full max-w-3xl">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  className="flex items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">
                      {step.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {step.description}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden sm:block w-12 lg:w-20 h-px bg-gray-200 mx-4" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
