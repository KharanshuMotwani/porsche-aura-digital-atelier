import { useState, useRef, useEffect, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import SplineScene from "@/components/SplineScene";
import BentoGrid from "@/components/BentoGrid";
import ExperienceSection from "@/components/ExperienceSection";
import PersonalizedJourney from "@/components/PersonalizedJourney";
import DigitalAtelier from "@/components/DigitalAtelier";
import SoundToggle from "@/components/SoundToggle";
import TestDriveOverlay from "@/components/TestDriveOverlay";
import { useEngineSound } from "@/hooks/useEngineSound";
import type { Application } from "@splinetool/runtime";

const SPEED_TARGET_MPH = 160;
const SPEED_RAMP_UP = 0.03;
const SPEED_RAMP_DOWN = 0.08;
const FADE_OUT_MS = 400;

const Index = () => {
  const { playRev, playStart, setEnabled } = useEngineSound();
  const [testDriveActive, setTestDriveActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [isRevving, setIsRevving] = useState(false);
  const splineRef = useRef<Application | null>(null);
  const engineAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeOutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSplineLoad = useCallback((app: Application) => {
    splineRef.current = app;
  }, []);

  // W key: press = play sound, emit event, ramp speed to 160; release = fade sound, ramp speed to 0
  useEffect(() => {
    if (!testDriveActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "w" && e.key !== "W") return;
      if (e.repeat) return;
      e.preventDefault();
      setIsRevving(true);
      // Play engine rev MP3 (add /public/engine-rev.mp3); fallback to synthetic rev
      try {
        if (!engineAudioRef.current) {
          engineAudioRef.current = new Audio("/engine-rev.mp3");
          engineAudioRef.current.loop = true;
        }
        engineAudioRef.current.volume = 1;
        engineAudioRef.current.play().catch(() => playRev());
      } catch {
        playRev();
      }
      // Trigger Spline drive event (use start_drive if your scene has it; else mouseDown)
      try {
        splineRef.current?.emitEvent?.("start_drive" as "mouseDown", "Porsche");
      } catch {
        splineRef.current?.emitEvent?.("mouseDown", "Porsche");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "w" && e.key !== "W") return;
      e.preventDefault();
      setIsRevving(false);
      // Fade out engine sound
      const audio = engineAudioRef.current;
      if (audio) {
        const startVol = audio.volume;
        const start = performance.now();
        if (fadeOutRef.current) clearInterval(fadeOutRef.current);
        fadeOutRef.current = setInterval(() => {
          const elapsed = performance.now() - start;
          const t = Math.min(elapsed / FADE_OUT_MS, 1);
          audio.volume = Math.max(0, startVol * (1 - t));
          if (t >= 1) {
            audio.pause();
            audio.currentTime = 0;
            if (fadeOutRef.current) {
              clearInterval(fadeOutRef.current);
              fadeOutRef.current = null;
            }
          }
        }, 16);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (fadeOutRef.current) clearInterval(fadeOutRef.current);
      engineAudioRef.current?.pause();
    };
  }, [testDriveActive]);

  // Speedometer animation: ramp up to 160 when revving, down to 0 when not
  useEffect(() => {
    if (!testDriveActive) return;
    let raf = 0;
    const tick = () => {
      setSpeed((s) => {
        if (isRevving) {
          const next = s + (SPEED_TARGET_MPH - s) * SPEED_RAMP_UP;
          return next >= SPEED_TARGET_MPH - 0.5 ? SPEED_TARGET_MPH : next;
        }
        const next = s * (1 - SPEED_RAMP_DOWN);
        return next < 0.5 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [testDriveActive, isRevving]);

  // Reset speed when exiting test drive
  useEffect(() => {
    if (!testDriveActive) {
      setSpeed(0);
      setIsRevving(false);
      engineAudioRef.current?.pause();
      engineAudioRef.current = null;
      if (fadeOutRef.current) {
        clearInterval(fadeOutRef.current);
        fadeOutRef.current = null;
      }
    }
  }, [testDriveActive]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SoundToggle onToggle={setEnabled} />
      <HeroSection
        onStartSound={playStart}
        onRevSound={playRev}
        onStartTestDrive={() => setTestDriveActive(true)}
      />
      <SplineScene onSplineLoad={handleSplineLoad} />
      <BentoGrid />
      <ExperienceSection onRevSound={playRev} />
      <PersonalizedJourney onRevSound={playRev} />
      <div className="h-16" />
      <DigitalAtelier />

      {testDriveActive && (
        <TestDriveOverlay
          speed={speed}
          isRevving={isRevving}
          onExit={() => setTestDriveActive(false)}
        />
      )}
    </div>
  );
};

export default Index;
