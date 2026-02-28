import { motion } from "framer-motion";
import type { Application } from "@splinetool/runtime";
import SplineViewer from "@/components/SplineViewer";

type SplineSceneProps = {
  onSplineLoad?: (app: Application) => void;
};

const SplineScene = ({ onSplineLoad }: SplineSceneProps) => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-xs tracking-[0.5em] uppercase text-muted-foreground"
        >
          Experience in 3D · Drag to rotate
        </motion.p>

        <div className="relative w-full flex-1 flex items-center justify-center px-4">
          <SplineViewer
            containerClassName="w-full max-w-6xl h-[70vh] min-h-[400px]"
            onSplineLoad={onSplineLoad}
          />
        </div>
      </div>
    </section>
  );
};

export default SplineScene;
