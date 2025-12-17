import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "../components/home/HeroSection";
import CoreCapabilitiesSection from "@/components/home/CoreCapabilitiesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import RoadmapSection from "@/components/home/RoadmapSection";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";

export default function HomePage() {
  return (
    <div>
      <Header />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CoreCapabilitiesSection />
        <TestimonialsSection />
        <RoadmapSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}