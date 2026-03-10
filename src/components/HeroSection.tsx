import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RainEffect from "./RainEffect";
import PointerHotspot from "./PointerHotspot";
import CarModelViewer from "./CarModelViewer";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

import { useRef } from "react";

type HeroSectionProps = {
  onStartSound?: () => void;
  onRevSound?: () => void;
  onStartTestDrive?: () => void;
};

const HeroSection = ({ onRevSound, onStartTestDrive }: HeroSectionProps) => {
  const { initAudio, playClick } = useAmbientAudio();
  const [isInteractive, setIsInteractive] = useState(false);
  const [activePointer, setActivePointer] = useState<number | null>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const hasPlayedRevAudio = useRef(false);
  const engineAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeOutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (fadeOutRef.current) clearInterval(fadeOutRef.current);
      if (engineAudioRef.current) {
        engineAudioRef.current.pause();
        engineAudioRef.current = null;
      }
    };
  }, []);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // The headlights usually flash around 1.3 - 1.5 seconds in standard car sequences.
    // Trigger the rev sound slightly before 1.5s
    if (video.currentTime > 1.3 && !hasPlayedRevAudio.current) {
      hasPlayedRevAudio.current = true;
      try {
        if (!engineAudioRef.current) {
          engineAudioRef.current = new Audio("/dragon-studio-car-engine-372477.mp3");
          engineAudioRef.current.volume = 0.8;
        }
        engineAudioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));

        // Initiate a slow fadeout sequence mimicking an engine returning to idle, then off
        setTimeout(() => {
          if (!engineAudioRef.current) return;
          const audio = engineAudioRef.current;
          const startVol = audio.volume;
          const start = performance.now();
          const fadeDuration = 3000; // 3 seconds fade out

          if (fadeOutRef.current) clearInterval(fadeOutRef.current);
          fadeOutRef.current = setInterval(() => {
            const elapsed = performance.now() - start;
            const t = Math.min(elapsed / fadeDuration, 1);
            if (engineAudioRef.current) {
              engineAudioRef.current.volume = Math.max(0, startVol * (1 - t));
            }
            if (t >= 1) {
              if (engineAudioRef.current) {
                engineAudioRef.current.pause();
                engineAudioRef.current.currentTime = 0;
              }
              if (fadeOutRef.current) {
                clearInterval(fadeOutRef.current);
                fadeOutRef.current = null;
              }
            }
          }, 50);
        }, 2000); // Start fading 2 seconds after playing
      } catch (err) {
        console.log("Audio failed to initialize", err);
      }
    }
  };

  // Parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-end feel
  const springConfig = { damping: 40, stiffness: 120, mass: 1.5 }; // Weightier feel
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const cinematicEase = [0.22, 1, 0.36, 1] as const;

  // Safe Parallax only for atmospheric elements (rain, light flares)
  const atmosphericX = useTransform(smoothX, [-0.5, 0.5], [15, -15]);
  const atmosphericY = useTransform(smoothY, [-0.5, 0.5], [15, -15]);

  // Distant City Lights Parallax
  const cityLightsX = useTransform(smoothX, [-0.5, 0.5], [5, -5]);
  const cityLightsY = useTransform(smoothY, [-0.5, 0.5], [5, -5]);

  // Scroll depth physics
  const { scrollY } = useScroll();
  const cameraZoom = useTransform(scrollY, [0, 800], [1, 1.15]);
  const bgBlur = useTransform(scrollY, [0, 500], [0, 10]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isInteractive) {
      setIsInteractive(true);
      initAudio(); // Satisfies browser autoplay rules on first interaction
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(px);
    mouseY.set(py);
  };

  return (
    <motion.section
      className="relative w-full h-screen overflow-hidden bg-black font-sans perspective-[1000px]"
      onMouseMove={handleMouseMove}
      onClick={() => {
        initAudio();
        setActivePointer(null); // Clicking outside closes panels
      }}
      style={{ opacity: heroOpacity }}
    >
      <motion.div style={{ scale: cameraZoom }} className="absolute inset-0 w-full h-full transform-gpu">

        {/* === LAYER 1: VIDEO BACKGROUND === */}
        <motion.div
          animate={{ scale: [1.0, 1.05, 1.0], x: ['0%', '-1%', '0%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: cinematicEase }}
          className="absolute inset-0 w-full h-full"
        >
          <video
            src="/Luxury_Porsche_Soundscape_Commercial.mp4"
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={() => setIsVideoEnded(true)}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        </motion.div>

        {/* Dynamic Safe-Parallax Light Blooms */}
        <motion.div
          style={{ x: cityLightsX, y: cityLightsY }}
          className="absolute inset-0 z-[1] pointer-events-none mix-blend-screen"
        >
          <motion.div animate={{ opacity: [0.4, 0.8, 0.5] }} transition={{ duration: 5, repeat: Infinity, ease: cinematicEase }} className="absolute top-[35%] left-[20%] w-[120px] h-[120px] bg-amber-500/20 rounded-full blur-[50px]" />
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: cinematicEase }} className="absolute top-[40%] right-[30%] w-[180px] h-[180px] bg-sky-500/20 rounded-full blur-[60px]" />
        </motion.div>

        {/* Scroll Blur overlay */}
        <motion.div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{ backdropFilter: useTransform(bgBlur, b => `blur(${b}px)`) }}
        />
      </motion.div>

      <RainEffect />

      {/* Lens Droplets Effect Overlay */}
      <motion.div style={{ x: atmosphericX, y: atmosphericY }} className="absolute inset-0 pointer-events-none z-20">
        <svg className="hidden">
          <filter id="droplet-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <motion.div
          initial={{ top: '-10%', left: '20%', opacity: 0 }}
          animate={{ top: '60%', opacity: [0, 0.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2, ease: "linear" }}
          className="absolute w-[2px] h-[30px] rounded-full bg-white/20 backdrop-blur-sm"
          style={{ filter: "url(#droplet-distortion)" }}
        />
        <motion.div
          initial={{ top: '-5%', left: '75%', opacity: 0 }}
          animate={{ top: '80%', opacity: [0, 0.4, 0] }}
          transition={{ duration: 12, repeat: Infinity, delay: 5, ease: "linear" }}
          className="absolute w-[3px] h-[40px] rounded-full bg-white/10 backdrop-blur-xl"
          style={{ filter: "url(#droplet-distortion)" }}
        />
      </motion.div>

      {/* Subtle Cinematic Grading & Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none z-20" />
      <div className="absolute inset-0 bg-[#0a0c10]/10 mix-blend-overlay pointer-events-none z-20" />

      {/* Robotic Feature Pointers Container */}
      <AnimatePresence>
        {isVideoEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 pointer-events-none w-full h-full md:max-w-[1400px] md:mx-auto"
          >
            <PointerHotspot
              // delay starts counting AFTER isVideoEnded becomes true
              title="DRIVING PLEASURE"
              subtitle="AERODYNAMIC FOCUS"
              tooltipText="Optimal system response achieved. Adaptive aerodynamics dynamically adjust to minimize drag and increase raw cornering downforce."
              top="45%"
              left="32%"
              lineDirection="left"
              lineWidth="140px"
              delay={0.8}
              playClick={playClick}
              isOpen={activePointer === 1}
              onToggle={() => setActivePointer(activePointer === 1 ? null : 1)}
            />
            <PointerHotspot
              title="PERFORMANCE"
              subtitle="CARBON CERAMIC"
              tooltipText="Lightweight forged alloys housing precision-engineered carbon-ceramic brake systems for thermal resistance."
              top="65%"
              left="25%"
              lineDirection="left"
              lineWidth="110px"
              lineOffset="bottom"
              hookDirection="down"
              delay={1.1} // +0.3s stagger
              playClick={playClick}
              isOpen={activePointer === 2}
              onToggle={() => setActivePointer(activePointer === 2 ? null : 2)}
            />
            <PointerHotspot
              title="HUMAN CENTERED"
              tooltipText="Telemetry cockpit wraps around the driver, ensuring minimal latency between human input and mechanical response."
              top="48%"
              left="67%"
              lineDirection="right"
              lineWidth="120px"
              delay={1.4} // +0.3s stagger
              playClick={playClick}
              isOpen={activePointer === 3}
              onToggle={() => setActivePointer(activePointer === 3 ? null : 3)}
            />
            <PointerHotspot
              title="ADVANCED SAFETY"
              subtitle="AURA VISION"
              tooltipText="Predictive stability management coupled with active rear-axle steering for flawless directional authority."
              top="66%"
              left="75%"
              lineDirection="right"
              lineWidth="100px"
              lineOffset="bottom"
              hookDirection="down"
              delay={1.7} // +0.3s stagger
              playClick={playClick}
              isOpen={activePointer === 4}
              onToggle={() => setActivePointer(activePointer === 4 ? null : 4)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Framing Border & UI */}
      <div className="absolute inset-6 md:inset-12 border border-white/[0.08] rounded pointer-events-none z-40 flex flex-col">
        <header className="flex justify-between items-center px-6 md:px-10 pt-8 pointer-events-auto">
          <div className="flex items-center mix-blend-screen bg-transparent">
            <img
              src="https://logos-world.net/wp-content/uploads/2021/04/Porsche-Logo.png"
              alt="Porsche"
              className="h-16 md:h-20 w-auto opacity-90 drop-shadow-2xl brightness-150"
              onError={(e) => {
                e.currentTarget.src = "https://cdn.worldvectorlogo.com/logos/porsche-6.svg";
              }}
            />
          </div>

          <motion.nav
            className="hidden md:flex items-center gap-10 text-[10px] font-bold tracking-[0.15em] uppercase text-white/90 font-sans"
            initial="hidden"
            animate={isVideoEnded ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.2 }
              }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: cinematicEase } } }}>
              <Link to="/configurator" className="hover:text-white hover:text-shadow-glow hover:-translate-y-0.5 transition-all text-shadow-md">Build your Porsche</Link>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: cinematicEase } } }}>
              <button onClick={() => { playClick(); alert("Comparison Modal Opened!") }} className="hover:text-white hover:text-shadow-glow hover:-translate-y-0.5 transition-all text-shadow-md tracking-[0.15em] uppercase">Compare</button>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: cinematicEase } } }}>
              <button onClick={() => { playClick(); alert("Dealer Locator Opened!") }} className="hover:text-white hover:text-shadow-glow hover:-translate-y-0.5 transition-all text-shadow-md tracking-[0.15em] uppercase">Find a dealer</button>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: cinematicEase } } }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTestDrive?.();
                  onRevSound?.();
                }}
                className="bg-zinc-100 text-black px-6 py-2.5 hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 border border-white/20"
              >
                Test Drive
              </button>
            </motion.div>
          </motion.nav>
        </header>

        {/* Cinematic Center Headline */}
        <div className="absolute top-[25%] md:top-[28%] w-full text-center pointer-events-none flex flex-col items-center">
          <AnimatePresence>
            {isVideoEnded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: 0.2, ease: cinematicEase }}
                  className="w-16 h-[1px] bg-white/50 mb-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
                <motion.h1
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
                  className="text-white text-4xl md:text-6xl tracking-[0.4em] md:tracking-[0.6em] font-sans font-extralight uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] ml-[0.4em]"
                >
                  CARRERA
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Dust Particles Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-screen opacity-40">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) + 200,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.1
            }}
            animate={{
              y: "-20vh",
              opacity: [0, Math.random() * 0.5 + 0.2, 0],
              x: `+=${Math.random() * 100 - 50}px`
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 20
            }}
            className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Global Realism Effects: Film Grain & Reflection Filters */}
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03]">
        <svg width="100%" height="100%">
          <filter id="film-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#film-grain)" />
        </svg>
      </div>

      <svg className="hidden">
        <filter id="reflection-ripple">
          <feTurbulence type="turbulence" baseFrequency="0.01 0.1" numOctaves="2" seed="1">
            <animate attributeName="baseFrequency" dur="10s" values="0.01 0.1;0.015 0.15;0.01 0.1" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="20" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </motion.section>
  );
};

export default HeroSection;
