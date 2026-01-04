"use client";

import { motion } from "framer-motion";
import { Upload, Settings, CheckCircle } from "lucide-react";
import { LANDING_CONTENT } from "@/lib/constants/landing";
import { scrollReveal } from "@/lib/animations/variants";

const iconMap = {
  Upload,
  Settings,
  CheckCircle,
};

export function HowItWorks() {
  const { howItWorks } = LANDING_CONTENT;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-16"
          {...scrollReveal}
        >
          {howItWorks.heading}
        </motion.h2>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 hidden lg:block" style={{ top: "2rem" }} />

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.steps.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 max-w-xs">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
