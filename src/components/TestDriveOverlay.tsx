import { motion } from "framer-motion";
import { X } from "lucide-react";

type TestDriveOverlayProps = {
  speed: number;
  isRevving: boolean;
  onExit: () => void;
};

const TestDriveOverlay = ({ speed, isRevving, onExit }: TestDriveOverlayProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[200] pointer-events-none"
      initial={false}
      animate={
        isRevving
          ? {
              x: [0, -3, 3, -2, 2, -1, 1, 0],
              transition: { duration: 0.4, repeat: Infinity, repeatDelay: 0.1 },
            }
          : { x: 0 }
      }
    >
      {/* Exit button - pointer-events auto so it's clickable */}
      <div className="absolute top-6 right-6 z-10 pointer-events-auto">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-sm font-medium text-white/90 hover:bg-black/60 hover:border-primary/50 hover:text-primary transition-all"
          aria-label="Exit Test Drive"
        >
          <X className="w-4 h-4" />
          Exit Test Drive
        </button>
      </div>

      {/* Speedometer - bottom center, glassmorphic */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-8 py-5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 mb-1 font-sans">
            Speed · Hold W to accelerate
          </p>
          <p
            className="font-mono text-5xl md:text-6xl font-light tabular-nums text-white tracking-tighter"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(speed)}
            <span className="text-2xl md:text-3xl text-white/60 font-normal ml-1">
              MPH
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestDriveOverlay;
