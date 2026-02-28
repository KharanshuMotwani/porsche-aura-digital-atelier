import { motion } from "framer-motion";
import { Battery, Gauge, Wind, Zap, Shield, Cpu } from "lucide-react";

const specs = [
  {
    icon: Zap,
    title: "Dual Motor AWD",
    desc: "Experience instantaneous torque delivery powered by an 800-volt architecture. Our intelligent all-wheel drive system dynamically distributes power between the front and rear axles in milliseconds, ensuring maximum traction and breathtaking acceleration under any conditions.",
    span: "col-span-2",
  },
  {
    icon: Battery,
    title: "120 kWh Battery",
    desc: "Next-generation solid-state cell architecture. Features advanced thermal management for consistent performance output and ultra-fast charging capabilities up to 350 kW, enabling 10-80% charge in just 15 minutes.",
    span: "",
  },
  {
    icon: Gauge,
    title: "340 km/h",
    desc: "Electronically limited top speed achieved through a sophisticated two-speed transmission on the rear axle, optimizing both efficiency at cruising speeds and raw performance during maximum acceleration.",
    span: "",
  },
  {
    icon: Wind,
    title: "0.19 Cd",
    desc: "Class-leading aerodynamic efficiency. Active aerodynamics automatically adapt the rear wing and cooling flaps based on speed and driving mode to minimize drag or maximize downforce when needed.",
    span: "",
  },
  {
    icon: Shield,
    title: "Carbon Monocoque",
    desc: "Motorsport-derived full carbon fiber monocoque construction. This provides exceptional torsional rigidity and side-impact protection while significantly reducing overall vehicle weight for unmatched agility.",
    span: "",
  },
  {
    icon: Cpu,
    title: "Neural Drive",
    desc: "The nerve center of the Aura. AI-powered driving dynamics utilize predictive chassis control, analyzing road conditions via LiDAR and camera arrays to adjust the adaptive air suspension in real-time, delivering the perfect balance of comfort and precise handling.",
    span: "col-span-2",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const BentoGrid = () => {
  return (
    <section className="relative px-6 md:px-16 py-16 max-w-7xl mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3"
      >
        Engineering
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl font-light tracking-tight mb-10"
      >
        Specifications
      </motion.h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {specs.map((spec) => (
          <motion.div
            key={spec.title}
            variants={item}
            className={`glass-panel rounded-xl p-6 md:p-8 group hover:gold-border transition-colors duration-500 ${spec.span}`}
          >
            <spec.icon className="w-5 h-5 text-primary mb-4 group-hover:text-gold-glow transition-colors" />
            <h3 className="text-lg md:text-xl font-medium tracking-tight mb-2">{spec.title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{spec.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BentoGrid;
