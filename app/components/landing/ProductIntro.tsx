"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Zap, CheckCircle2 } from "lucide-react";
import { LANDING_CONTENT } from "@/lib/constants/landing";
import { scrollReveal } from "@/lib/animations/variants";

export function ProductIntro() {
  const { productIntro } = LANDING_CONTENT;

  return (
    <section className="py-24 bg-section-alt">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div {...scrollReveal}>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
              {productIntro.heading}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {productIntro.description}
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Test Cases</span>
              </div>

              <ArrowRight className="h-6 w-6 text-gray-400" />

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Analysis</span>
              </div>

              <ArrowRight className="h-6 w-6 text-gray-400" />

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Suggestions</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
