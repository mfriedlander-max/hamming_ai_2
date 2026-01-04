"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BackgroundPattern } from "./BackgroundPattern";
import { LANDING_CONTENT } from "@/lib/constants/landing";
import { scrollReveal } from "@/lib/animations/variants";

export function FinalCTA() {
  const { finalCTA } = LANDING_CONTENT;

  return (
    <section className="relative py-24 gradient-cta overflow-hidden">
      <BackgroundPattern pattern="diagonal" opacity={0.01} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          {...scrollReveal}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            {finalCTA.heading}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {finalCTA.subheading}
          </p>
          <Link href={finalCTA.buttonHref}>
            <Button size="lg" className="text-lg px-12 py-6 h-auto">
              {finalCTA.buttonText}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
