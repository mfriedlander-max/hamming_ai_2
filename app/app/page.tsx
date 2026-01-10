import { HeroSection } from "@/components/landing/HeroSection";
import { WorkflowStrip } from "@/components/landing/WorkflowStrip";
import { MockEditor } from "@/components/landing/MockEditor";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <WorkflowStrip />
      <MockEditor />
      <FeatureGrid />
      <FinalCTA />
    </main>
  );
}
