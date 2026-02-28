import HeroSection from "@/components/HeroSection";
import BentoGrid from "@/components/BentoGrid";
import DigitalAtelier from "@/components/DigitalAtelier";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <BentoGrid />
      {/* Spacer for fixed dock */}
      <div className="h-32" />
      <DigitalAtelier />
    </div>
  );
};

export default Index;
