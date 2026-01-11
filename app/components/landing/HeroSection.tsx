"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BackgroundPattern } from "./BackgroundPattern";
import { LANDING_CONTENT } from "@/lib/constants/landing";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;

  return (
    <section className="relative gradient-hero animate-gradient -mb-32 pb-32">
      <BackgroundPattern pattern="dots" opacity={0.015} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl max-w-3xl leading-[2.25]">
              {hero.headline}{" "}
              <span className="text-blue-600">{hero.headlineAccent}</span>
            </h1>
          </motion.div>

          <motion.p
            className="mt-6 text-lg leading-8 text-gray-600 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {hero.subheadline1}
          </motion.p>

          <motion.p
            className="mt-2 max-w-xl text-lg leading-8 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {hero.subheadline2}
          </motion.p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link href={hero.primaryCTAHref}>
              <Button size="lg" className="text-base px-8">
                {hero.primaryCTA}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
