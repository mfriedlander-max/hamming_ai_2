import { HeroSection } from "@/components/landing/HeroSection";
import { ProductIntro } from "@/components/landing/ProductIntro";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProductIntro />
      <FeatureGrid />
      <HowItWorks />
      <UseCases />
      <FinalCTA />
    </main>
  );
}
