import { motion } from "framer-motion";
import { useState } from "react";
import { Palette, RotateCcw, Maximize2, Settings2, ChevronUp } from "lucide-react";

const colors = [
  { name: "Obsidian", hsl: "0 0% 8%" },
  { name: "Carrara", hsl: "0 0% 92%" },
  { name: "Aurum", hsl: "43 72% 55%" },
  { name: "Enzian", hsl: "225 50% 25%" },
  { name: "Rubin", hsl: "0 65% 35%" },
];

const DigitalAtelier = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeColor, setActiveColor] = useState(0);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.5 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Expanded panel */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 200 : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="glass-panel gold-glow border-t border-b-0 rounded-t-2xl mx-4 md:mx-auto md:max-w-3xl p-6">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">Exterior Finish</p>
          <div className="flex items-center gap-4">
            {colors.map((color, i) => (
              <button
                key={color.name}
                onClick={() => setActiveColor(i)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    activeColor === i ? "border-primary scale-110" : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: `hsl(${color.hsl})` }}
                />
                <span className={`text-[10px] tracking-widest uppercase transition-colors ${
                  activeColor === i ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dock bar */}
      <div className="glass-panel border-t mx-4 md:mx-auto md:max-w-3xl rounded-t-2xl px-4 py-3 flex items-center justify-between"
        style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <div className="flex items-center gap-1">
          <DockButton icon={Palette} label="Color" onClick={() => setExpanded(!expanded)} active={expanded} />
          <DockButton icon={Settings2} label="Wheels" />
          <DockButton icon={Maximize2} label="Interior" />
          <DockButton icon={RotateCcw} label="360°" />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground tracking-wider">Starting from</p>
            <p className="text-sm font-medium tracking-tight">€ 189,900</p>
          </div>
          <button className="bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
            Configure
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DockButton = ({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-[9px] tracking-widest uppercase">{label}</span>
  </button>
);

export default DigitalAtelier;
