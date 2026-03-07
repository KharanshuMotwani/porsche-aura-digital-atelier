import { motion, useScroll, useTransform, animate } from "framer-motion";
import { useState, useEffect } from "react";

type HeroSectionProps = {
  onStartSound?: () => void;
  onRevSound?: () => void;
  onStartTestDrive?: () => void;
};

const HeroSection = ({ onStartSound, onRevSound, onStartTestDrive }: HeroSectionProps) => {
  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black font-sans"
      onClick={onStartSound}
    >
      {/* Animated Motion Graphic Background - Ken Burns effect */}
      <motion.div
        animate={{ scale: [1.02, 1.08, 1.02] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full object-cover"
        style={{ backgroundImage: 'url("/porsche-bg.jpg")' }}
      ></motion.div>

      {/* Motion Graphic Floating Gold Particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full shadow-[0_0_15px_#eab308] pointer-events-none z-0"
          style={{
            background: "linear-gradient(135deg, hsl(43 74% 49%), hsl(43 90% 65%))",
            width: Math.random() * 4 + 1 + "px",
            height: Math.random() * 4 + 1 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
          }}
          animate={{
            y: [0, -150 - Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, Math.random() * 0.8 + 0.2, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Pulsing Cinematic Brake Light Glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[52%] left-1/2 -translate-x-1/2 w-[50%] h-[15%] bg-red-600/30 blur-[80px] pointer-events-none z-0"
      />

      {/* Subtle Color Grading Overlay */}
      <div className="absolute inset-0 bg-[#0a0f18]/10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>

      {/* The Thin Framing Border */}
      <div className="absolute inset-6 md:inset-12 border border-white/[0.15] rounded border-b-2 pointer-events-none z-10 flex flex-col backdrop-blur-[1px]">

        {/* Header inside the frame */}
        <header className="flex justify-between items-center px-6 md:px-10 pt-8 pointer-events-auto">
          {/* Logo */}
          <div className="flex items-center mix-blend-screen bg-transparent">
            {/* White-background logo: using mix-blend-multiply directly on image works if the background is light, but since the background is dark, we need a different approach or a cleanly cut out PNG. 
                Using the SVG from world vector logo as an object/mask is cleaner, or we can use a known isolated transparent PNG. */}
            <img
              src="https://logos-world.net/wp-content/uploads/2021/04/Porsche-Logo.png"
              alt="Porsche"
              className="h-16 md:h-20 w-auto opacity-100 drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = "https://cdn.worldvectorlogo.com/logos/porsche-6.svg";
              }}
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold tracking-[0.15em] uppercase text-white/90 font-sans">
            <a href="#" className="hover:text-white hover:text-shadow-glow hover:-translate-y-0.5 transition-all">Build your Porsche</a>
            <a href="#" className="hover:text-white hover:text-shadow-glow hover:-translate-y-0.5 transition-all">Compare</a>
            <a href="#" className="hover:text-white hover:text-shadow-glow hover:-translate-y-0.5 transition-all">Find a dealer</a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTestDrive?.();
                onRevSound?.();
              }}
              className="bg-gradient-to-r from-[#ecd253] to-[#d4ad1e] text-black px-6 py-2.5 hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] active:scale-95"
            >
              Test Drive
            </button>
          </nav>
        </header>

        {/* Center Title */}
        <div className="absolute top-[25%] md:top-[28%] w-full text-center pointer-events-none z-0">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="text-white/95 text-6xl md:text-8xl tracking-wider drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Great Vibes', cursive", textShadow: "0px 2px 20px rgba(0,0,0,0.8)" }}
          >
            911 Carrera
          </motion.h1>
        </div>


        {/* Hotspots */}

        {/* Hotspot 1: New Dimension (Top Left) */}
        <Hotspot
          title="NEW DIMENSION OF"
          subtitle="DRIVING PLEASURE"
          top="46%"
          left="32%"
          lineDirection="left"
          lineWidth="160px"
          onClick={onRevSound}
        />

        {/* Hotspot 2: Performance (Bottom Left) */}
        <Hotspot
          title="PERFORMANCE"
          top="68%"
          left="24%"
          lineDirection="left"
          lineWidth="110px"
          lineOffset="bottom"
          hookDirection="down"
          onClick={onRevSound}
        />

        {/* Hotspot 3: Human Centered (Top Right) */}
        <Hotspot
          title="HUMAN CENTERED"
          top="49%"
          left="68%"
          lineDirection="right"
          lineWidth="100px"
          onClick={onRevSound}
        />

        {/* Hotspot 4: Advance Safety (Bottom Right) */}
        <Hotspot
          title="ADVANCE"
          subtitle="SAFETY"
          top="66%"
          left="77%"
          lineDirection="right"
          lineWidth="100px"
          lineOffset="bottom"
          hookDirection="down"
          onClick={onRevSound}
        />

      </div>
    </section>
  );
};

// Tooltip/Hotspot component mirroring the design
const Hotspot = ({
  title,
  subtitle,
  top,
  left,
  lineDirection,
  lineWidth,
  lineOffset = "center",
  hookDirection = "none",
  onClick
}: {
  title: string,
  subtitle?: string,
  top: string,
  left: string,
  lineDirection: 'left' | 'right',
  lineWidth: string,
  lineOffset?: 'top' | 'center' | 'bottom',
  hookDirection?: 'down' | 'up' | 'none',
  onClick?: () => void
}) => {
  return (
    <div
      className="absolute z-20 pointer-events-auto"
      style={{ top, left, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative group flex items-center justify-center">

        {/* The actual dot button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="relative w-[28px] h-[28px] rounded-full bg-gradient-to-b from-[#fde66d] to-[#d4ad1e] border-2 border-[#fff]/40 shadow-[0_0_30px_rgba(255,220,100,0.8)] flex items-center justify-center text-white z-10 hover:scale-110 hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="text-white text-lg font-light leading-none mb-0.5 text-shadow-sm">+</span>

          {/* Dashed outer glowing ring */}
          <div className="absolute inset-[-6px] rounded-full border-[1.5px] border-dotted border-[#fde66d]/70 group-hover:rotate-180 transition-transform duration-1000 ease-linear pointer-events-none"></div>
        </button>

        {/* Connector Line and Text */}
        <div
          className={`absolute pointer-events-none flex flex-col justify-end
            ${lineDirection === 'left' ? 'items-end right-1/2 mr-3' : 'items-start left-1/2 ml-3'}
            ${lineOffset === 'top' ? 'bottom-2' : lineOffset === 'bottom' ? 'top-3' : 'top-1/2 -translate-y-1/2'}
            opacity-80 group-hover:opacity-100 transition-opacity duration-500
          `}
          style={{ width: lineWidth }}
        >
          {/* Text Label */}
          <div className={`mb-1.5 flex flex-col ${lineDirection === 'left' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] md:text-[11px] font-semibold text-white tracking-[0.08em] whitespace-nowrap leading-tight uppercase border-b border-white/80 pb-1 inline-block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
              {title}
            </div>
            {subtitle && (
              <div className="text-[10px] md:text-[11px] font-semibold text-white tracking-[0.08em] whitespace-nowrap leading-tight uppercase border-b border-white/80 pb-1 mt-0.5 inline-block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* The solid white line with dot and hook */}
          <div className="flex flex-col relative w-full">
            <div className="h-[1.5px] bg-white/90 w-full relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {/* Small dot at the far end of the horizontal line */}
              <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] ${lineDirection === 'left' ? 'left-0 -ml-0.5' : 'right-0 -mr-0.5'}`}></div>
            </div>

            {/* Dropping/Rising vertical hook at the end of the line */}
            {hookDirection !== 'none' && (
              <div className={`w-[1.5px] h-4 bg-white/50 absolute ${lineDirection === 'left' ? 'left-0' : 'right-0'} ${hookDirection === 'down' ? 'top-0' : 'bottom-0'}`}></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
