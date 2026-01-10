"use client";

import { motion } from "framer-motion";
import { Search, Target, Link2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { LANDING_CONTENT } from "@/lib/constants/landing";
import { scrollReveal } from "@/lib/animations/variants";

const iconMap = {
  Search,
  Target,
  Link: Link2,
};

export function FeatureGrid() {
  const { features } = LANDING_CONTENT;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-16"
          {...scrollReveal}
        >
          {features.heading}
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {features.items.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={feature.title}
                className="h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard
                  icon={Icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
