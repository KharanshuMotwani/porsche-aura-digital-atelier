import { useState, useRef, useEffect, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import CarModelViewer from "@/components/CarModelViewer";
import BentoGrid from "@/components/BentoGrid";
import ExperienceSection from "@/components/ExperienceSection";
import PersonalizedJourney from "@/components/PersonalizedJourney";
import DigitalAtelier from "@/components/DigitalAtelier";
import SoundToggle from "@/components/SoundToggle";
import TestDriveOverlay from "@/components/TestDriveOverlay";
import { useEngineSound } from "@/hooks/useEngineSound";

const SPEED_TARGET_MPH = 160;
const SPEED_RAMP_UP = 0.03;
const SPEED_RAMP_DOWN = 0.08;
const FADE_OUT_MS = 400;

const Index = () => {
  const { playRev, playStart, setEnabled } = useEngineSound();
  const [testDriveActive, setTestDriveActive] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SoundToggle onToggle={setEnabled} />
      <HeroSection
        onStartSound={playStart}
        onRevSound={playRev}
        onStartTestDrive={() => setTestDriveActive(true)}
      />
      <CarModelViewer />
      <BentoGrid />
      <ExperienceSection onRevSound={playRev} />
      <PersonalizedJourney onRevSound={playRev} />
      <div className="h-16" />
      <DigitalAtelier />

      {testDriveActive && (
        <TestDriveOverlay
          onExit={() => setTestDriveActive(false)}
        />
      )}
    </div>
  );
};

export default Index;
