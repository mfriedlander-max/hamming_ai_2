import { HeroSection } from "@/components/landing/HeroSection";
import { WorkflowSteps } from "@/components/landing/WorkflowSteps";
import { MockEditor } from "@/components/landing/MockEditor";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <WorkflowSteps />
      <MockEditor />
      <FeatureGrid />
      <FinalCTA />
    </main>
  );
}
