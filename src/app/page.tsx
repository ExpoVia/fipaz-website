import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FexpoParallax } from "@/components/landing/FexpoParallax";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FexpoEntranceExperience } from "@/components/landing/FexpoEntranceExperience";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ActorsSection } from "@/components/landing/ActorsSection";
import { MapShowcaseSection } from "@/components/landing/MapShowcaseSection";
import { NfcSection } from "@/components/landing/NfcSection";
import { MultiEventSection } from "@/components/landing/MultiEventSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen touch-pan-y touch-pinch-zoom bg-[var(--expo-bg)] text-[var(--expo-navy)] antialiased">
      <LandingHeader />

      <main>
        <HeroSection />
        <FexpoParallax />
        <SolutionSection />
        <FexpoEntranceExperience />
        <HowItWorksSection />
        <ActorsSection />
        <MapShowcaseSection />
        <NfcSection />
        <MultiEventSection />
        <ContactSection />
        <FinalCTASection />
      </main>

      <LandingFooter />
    </div>
  );
}
