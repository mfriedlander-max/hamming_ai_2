"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BackgroundPattern } from "./BackgroundPattern";
import { LANDING_CONTENT } from "@/lib/constants/landing";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;

  return (
    <section className="relative overflow-hidden gradient-hero animate-gradient">
      <BackgroundPattern pattern="dots" opacity={0.015} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {hero.headline}
              <br />
              <span className="text-blue-600">{hero.headlineAccent}</span>
            </h1>
          </motion.div>

          <motion.p
            className="mt-6 max-w-2xl text-lg leading-8 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link href={hero.primaryCTAHref}>
              <Button size="lg">{hero.primaryCTA}</Button>
            </Link>
            <Link href={hero.secondaryCTAHref}>
              <Button size="lg" variant="outline">
                {hero.secondaryCTA}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
