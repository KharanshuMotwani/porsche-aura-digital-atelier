import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const SoundToggle = ({ onToggle }: { onToggle: (enabled: boolean) => void }) => {
  const [enabled, setEnabled] = useState(true);

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3 }}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        onToggle(next);
      }}
      className="fixed top-6 right-8 z-50 flex items-center gap-2 px-3 py-2 rounded-lg glass-panel text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle sound"
    >
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      <span className="text-[9px] tracking-widest uppercase hidden md:inline">
        {enabled ? "Sound On" : "Sound Off"}
      </span>
    </motion.button>
  );
};

export default SoundToggle;
