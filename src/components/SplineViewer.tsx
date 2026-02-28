import { useState, useCallback, useRef } from "react";
import Spline from "@splinetool/react-spline";
import { motion } from "framer-motion";
import type { Application } from "@splinetool/runtime";

const SPLINE_SCENE_URL = "https://prod.spline.design/Tcokm1Z340J1pEWm/scene.splinecode";

const ROTATE_SENSITIVITY = 0.005;
const POSSIBLE_CAR_NAMES = ["Car", "Porsche", "Model", "Scene", "Root", "Object"];
const POSSIBLE_GROUND_NAMES = [
  "Ground", "Floor", "Plane", "Base", "floor", "ground", "Floor plane",
  "Ground plane", "FloorPlane", "GroundPlane", "Floor 1", "Ground 1",
  "Terrain", "Surface", "Platform", "Plane 1", "floor plane", "ground plane",
];
const GROUND_NAME_PATTERNS = /ground|floor|plane|terrain|surface|platform|base/i;

export type SplineViewerProps = {
  /** Optional label above the viewer */
  label?: string | null;
  /** Class for the outer wrapper */
  className?: string;
  /** Class for the interactive container (drag area + Spline). Defaults to w-full h-full min-h-[280px] */
  containerClassName?: string;
  /** Called when Spline has loaded; use to get the Application instance for emitEvent etc. */
  onSplineLoad?: (app: Application) => void;
};

const SplineViewer = ({ label = null, className = "", containerClassName = "w-full h-full min-h-[280px]", onSplineLoad }: SplineViewerProps) => {
  const [loaded, setLoaded] = useState(false);
  const splineRef = useRef<Application | null>(null);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const hideGround = useCallback((app: Application) => {
    const all = app.getAllObjects();
    if (import.meta.env.DEV) {
      console.log("[Spline] Scene object names:", all.map((o) => o.name));
    }
    for (const name of POSSIBLE_GROUND_NAMES) {
      const obj = app.findObjectByName(name);
      if (obj) obj.hide();
    }
    for (const obj of all) {
      const n = obj.name || "";
      if (GROUND_NAME_PATTERNS.test(n) && obj.visible) obj.hide();
    }
  }, []);

  const onLoad = useCallback(
    (splineApp: Application) => {
      splineRef.current = splineApp;
      hideGround(splineApp);
      onSplineLoad?.(splineApp);
      setLoaded(true);
    },
    [hideGround, onSplineLoad]
  );

  return (
    <div className={`relative ${className}`}>
      {label != null && label !== "" && (
        <p className="text-xs tracking-[0.5em] uppercase text-muted-foreground mb-2">
          {label}
        </p>
      )}
      <div
        className={`relative rounded-xl overflow-hidden translate-y-[10%] ${containerClassName}`}
      >
        {!loaded && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: loaded ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-secondary/80 z-10"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground tracking-widest uppercase">Loading scene</span>
            </div>
          </motion.div>
        )}
        <Spline
          scene={SPLINE_SCENE_URL}
          onLoad={onLoad}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default SplineViewer;
