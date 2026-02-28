import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Eye, Gauge, Wind } from "lucide-react";

const experiences = [
  {
    icon: Play,
    title: "Launch Control",
    subtitle: "Feel the 2.1s sprint",
    description: "Experience the raw acceleration of dual electric motors delivering 750 PS instantly to all four wheels.",
  },
  {
    icon: Eye,
    title: "AR Track View",
    subtitle: "Nürburgring in your space",
    description: "Project the legendary Nordschleife into your environment. Walk around the Aura as it conquers every corner.",
  },
  {
    icon: Gauge,
    title: "Telemetry Live",
    subtitle: "Real-time performance data",
    description: "Watch g-forces, battery thermals, and torque distribution in real-time as the car pushes its limits.",
  },
  {
    icon: Wind,
    title: "Aero Dynamics",
    subtitle: "Active wing simulation",
    description: "See how the adaptive aerodynamics reshape at every speed—drag coefficient dropping from 0.28 to 0.19.",
  },
];

const ExperienceSection = ({ onRevSound }: { onRevSound: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section ref={containerRef} className="relative px-6 md:px-16 py-32 max-w-7xl mx-auto overflow-hidden">
      {/* Parallax ambient glow */}
      <motion.div
        style={{ y }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none"
      />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3"
      >
        Immersive
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl font-light tracking-tight mb-6"
      >
        Feel The Performance
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-sm text-muted-foreground tracking-wider max-w-lg mb-16"
      >
        Not just a configurator—an emotional journey. Interact with sound, motion, and data.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onMouseEnter={() => {
              setHoveredIdx(i);
              if (i === 0) onRevSound();
            }}
            onMouseLeave={() => setHoveredIdx(null)}
            className="group relative glass-panel rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:gold-border"
          >
            {/* Hover glow */}
            <motion.div
              animate={{ opacity: hoveredIdx === i ? 0.15 : 0 }}
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                  <exp.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium tracking-tight">{exp.title}</h3>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{exp.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>

              {/* Interactive prompt */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: hoveredIdx === i ? 1 : 0, y: hoveredIdx === i ? 0 : 5 }}
                className="mt-4 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gold" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-primary">
                  {i === 0 ? "Hear the engine" : i === 1 ? "Coming soon — AR" : "Explore"}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
