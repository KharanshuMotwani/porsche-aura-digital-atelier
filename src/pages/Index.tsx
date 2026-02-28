import HeroSection from "@/components/HeroSection";
import BentoGrid from "@/components/BentoGrid";
import ExperienceSection from "@/components/ExperienceSection";
import PersonalizedJourney from "@/components/PersonalizedJourney";
import DigitalAtelier from "@/components/DigitalAtelier";
import SoundToggle from "@/components/SoundToggle";
import { useEngineSound } from "@/hooks/useEngineSound";

const Index = () => {
  const { playRev, playStart, setEnabled } = useEngineSound();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SoundToggle onToggle={setEnabled} />
      <HeroSection onStartSound={playStart} />
      <BentoGrid />
      <ExperienceSection onRevSound={playRev} />
      <PersonalizedJourney onRevSound={playRev} />
      {/* Spacer for fixed dock */}
      <div className="h-32" />
      <DigitalAtelier />
    </div>
  );
};

export default Index;
