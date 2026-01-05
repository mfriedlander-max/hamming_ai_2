"use client";

import { motion } from "framer-motion";
import { Layers, Code, Shield, FlaskConical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LANDING_CONTENT } from "@/lib/constants/landing";
import { scrollReveal } from "@/lib/animations/variants";

const iconMap = {
  Layers,
  Code,
  Shield,
  FlaskConical,
};

export function UseCases() {
  const { useCases } = LANDING_CONTENT;

  return (
    <section className="py-24 gradient-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-16"
          {...scrollReveal}
        >
          {useCases.heading}
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          {useCases.items.map((useCase, index) => {
            const Icon = iconMap[useCase.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{useCase.title}</h3>
                      <p className="text-sm text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
