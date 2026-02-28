import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import porscheHero from "@/assets/porsche-hero.png";

const HeroSection = ({ onStartSound }: { onStartSound: () => void }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const carY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const carScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.08]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
      
      {/* Gold ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6 md:px-16"
      >
        <span className="text-lg font-bold tracking-[0.3em] uppercase gold-text">Porsche</span>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground tracking-widest uppercase">
          <span className="hover:text-foreground transition-colors cursor-pointer">Models</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Experience</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Configure</span>
        </div>
        <span className="text-sm text-muted-foreground tracking-[0.2em] uppercase">Aura</span>
      </motion.nav>

      {/* Hero content */}
      <motion.div style={{ opacity: textOpacity }} className="relative z-10 text-center px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xs tracking-[0.5em] uppercase text-muted-foreground mb-6"
        >
          The New Standard
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-7xl md:text-[10rem] font-extralight tracking-tight leading-none mb-4"
        >
          <span className="gold-text">Aura</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-muted-foreground text-sm md:text-base tracking-widest uppercase max-w-md mx-auto"
        >
          Electric Performance Redefined
        </motion.p>
      </motion.div>

      {/* Hero car image with parallax */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.3, ease: "easeOut" }}
        style={{ y: carY, scale: carScale }}
        className="relative z-10 w-full max-w-5xl mx-auto mt-[-2rem] px-4 cursor-pointer"
        onMouseEnter={onStartSound}
      >
        <img
          src={porscheHero}
          alt="Porsche Aura concept car"
          className="w-full h-auto object-contain"
        />
        {/* Reflection fade */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="relative z-10 flex items-center justify-center gap-12 md:gap-20 mt-[-4rem] mb-8"
      >
        {[
          { value: "2.1s", label: "0-100 km/h" },
          { value: "750", label: "PS" },
          { value: "610", label: "km Range" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl md:text-4xl font-light tracking-tight gold-text">{stat.value}</p>
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-4 h-7 rounded-full border border-border flex items-start justify-center pt-1"
        >
          <div className="w-1 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
