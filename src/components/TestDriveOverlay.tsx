import { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Navigation } from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, PerspectiveCamera, Grid } from "@react-three/drei";
import { EffectComposer, RenderPass, UnrealBloomPass } from "three-stdlib";
import * as THREE from "three";

type TestDriveOverlayProps = {
  onExit: () => void;
};

/* ═══════════════════════════════════════════════════════════
   SPEED STREAKS (Visual Motion Effects)
   ═══════════════════════════════════════════════════════════ */
function SpeedStreaks({ speed }: { speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 40;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: Math.random() * 5 + 0.5,
      z: Math.random() * -100,
      speed: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current || speed < 5) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    positions.forEach((pos, i) => {
      pos.z += (speed * pos.speed * 0.4) * delta;
      if (pos.z > 10) {
        pos.z = -100 - Math.random() * 50;
        pos.x = (Math.random() - 0.5) * 40;
      }
      dummy.position.set(pos.x, pos.y, pos.z);
      // Stretch streaks based on speed
      dummy.scale.set(1, 1, speed * 0.1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.02, 0.02, 1]} />
      <meshBasicMaterial color="#ff3366" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM BLOOM PRE-PASS
   ═══════════════════════════════════════════════════════════ */
function CustomBloom() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<any>(null);

  useEffect(() => {
    composer.current = new EffectComposer(gl);
    composer.current.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      2.0, // strength
      0.5, // radius
      0.5  // threshold
    );
    composer.current.addPass(bloomPass);
    return () => {
      composer.current?.dispose();
    };
  }, [gl, scene, camera, size]);

  useFrame(() => {
    if (composer.current) composer.current.render();
  }, 1);

  return null;
}

/* ═══════════════════════════════════════════════════════════
   SCROLLING TRACK & SCENE
   ═══════════════════════════════════════════════════════════ */
function TestDriveScene({ speed, isAccelerating, isBraking }: { speed: number; isAccelerating: boolean; isBraking: boolean }) {
  const { scene, materials } = useGLTF("/car2/2012 Porsche 911 GT3 RS 4_0.glb") as any;
  const gridRef = useRef<any>(null);
  const carGroup = useRef<THREE.Group>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!materials) return;
    Object.keys(materials).forEach((key) => {
      const mat = materials[key] as THREE.MeshStandardMaterial;
      const k = key.toLowerCase();
      // Stealth mode car paint
      if (k.includes("body") || k.includes("paint") || k.endsWith("_ext") ||
        k.includes("carpaint") || k.includes("car_paint") || k.includes("shell")) {
        mat.map = null;
        mat.metalness = 0.9;
        mat.roughness = 0.15;
        mat.envMapIntensity = 2.0;
        mat.color.set("#050505");
        mat.needsUpdate = true;
      }
      if (k.includes("rim") || k.includes("spoke") || k.includes("wheel") || k.includes("hub") || k.includes("alloy")) {
        mat.map = null;
        mat.metalness = 0.95;
        mat.roughness = 0.06;
        mat.color.set("#111111");
        mat.needsUpdate = true;
      }
      // Glowing headlights
      if (k.includes("light") || k.includes("glass")) {
        if (k.includes("glass") || !k.includes("light")) return;
        mat.emissive.set("#ffffff");
        mat.emissiveIntensity = 8;
      }
    });
  }, [materials]);

  useFrame((state, delta) => {
    if (gridRef.current) {
      gridRef.current.position.z += (speed * 0.15) * delta;
      if (gridRef.current.position.z > 2) gridRef.current.position.z -= 2;
    }

    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          const n = child.name?.toLowerCase() || "";
          if (n.includes("wheel") || n.includes("rim") || n.includes("tire") || n.includes("tyre")) {
            child.rotation.x += delta * speed * 0.15;
          }
        }
      });
    }

    if (cameraRef.current) {
      // Dynamic FOV for tunnel vision
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 50 + (speed * 0.08), delta * 2);
      cameraRef.current.updateProjectionMatrix();

      // Speed shake & braking inertia
      const baseZ = 6;
      const targetZ = baseZ - (isBraking ? 0.5 : (speed * 0.01)); // Zoom in on brake, lag back on speed
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetZ, delta * 3);

      if (speed > 80) {
        const shake = (speed - 80) * 0.00015;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, (Math.random() - 0.5) * shake, 0.5);
        cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 1.5 + (Math.random() - 0.5) * shake, 0.5);
      } else {
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, 0, 0.1);
        cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 1.5, 0.1);
      }
    }

    if (carGroup.current) {
      // Tilt physics
      const targetPitch = isAccelerating ? -0.025 : (isBraking ? 0.04 : 0);
      carGroup.current.rotation.x = THREE.MathUtils.lerp(carGroup.current.rotation.x, targetPitch, delta * 6);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.5, 6]} fov={50} />
      <Environment preset="night" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, 5, -5]} intensity={5} color="#ff0033" />

      <group ref={carGroup}>
        <primitive object={scene} scale={1.2} position={[0, -0.6, 0]} rotation={[0, Math.PI, 0]} />
        <ContactShadows position={[0, -0.6, 0]} opacity={0.8} scale={10} blur={2} far={4} color="#000000" />
        {/* Red Neon Underglow */}
        <pointLight position={[0, -0.4, 0]} color="#ff0033" intensity={10} distance={5} />
      </group>

      <SpeedStreaks speed={speed} />

      <Grid
        ref={gridRef}
        position={[0, -0.61, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={1.5}
        cellColor="#660011"
        sectionSize={5}
        sectionThickness={2.5}
        sectionColor="#ff0033" // Glowing neon red
        fadeDistance={80}
        fadeStrength={2}
      />

      <fogExp2 attach="fog" color="#020005" density={0.03} />

      <CustomBloom />
    </>
  );
}


/* ═══════════════════════════════════════════════════════════
   MAIN OVERLAY COMPONENT
   ═══════════════════════════════════════════════════════════ */
const TestDriveOverlay = ({ onExit }: TestDriveOverlayProps) => {
  const [speed, setSpeed] = useState(0);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const engineAudioRef = useRef<HTMLAudioElement | null>(null);

  const SPEED_TARGET_MPH = 160;
  const SPEED_RAMP_UP = 0.025;
  const SPEED_RAMP_DOWN = 0.03;
  const BRAKE_POWER = 0.08;

  useEffect(() => {
    // Hide hint after 4 seconds
    const hintTimer = setTimeout(() => setShowHint(false), 4000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") setIsAccelerating(true);
      if (e.key === "s" || e.key === "ArrowDown" || e.key === " ") setIsBraking(true);
      if (e.key === "Escape") onExit();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") setIsAccelerating(false);
      if (e.key === "s" || e.key === "ArrowDown" || e.key === " ") setIsBraking(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    engineAudioRef.current = new Audio("/engine-rev.mp3");
    engineAudioRef.current.loop = true;

    return () => {
      clearTimeout(hintTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      engineAudioRef.current?.pause();
    };
  }, [onExit]);

  useEffect(() => {
    if (engineAudioRef.current) {
      if (isAccelerating) {
        engineAudioRef.current.play().catch(() => { });
        engineAudioRef.current.volume = Math.min(1, engineAudioRef.current.volume + 0.1);
        engineAudioRef.current.playbackRate = 1.0 + (speed / SPEED_TARGET_MPH);
      } else if (isBraking) {
        engineAudioRef.current.volume = Math.max(0, engineAudioRef.current.volume - 0.1);
        engineAudioRef.current.playbackRate = Math.max(0.5, engineAudioRef.current.playbackRate - 0.05);
      } else {
        // Idle sound when rolling
        engineAudioRef.current.volume = Math.max(0.1, engineAudioRef.current.volume - 0.05);
        engineAudioRef.current.playbackRate = Math.max(0.8, engineAudioRef.current.playbackRate - 0.02);
        if (speed < 1) engineAudioRef.current.pause();
      }
    }
  }, [isAccelerating, isBraking, speed]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setSpeed((s) => {
        let next = s;
        if (isAccelerating && !isBraking) {
          next = s + (SPEED_TARGET_MPH - s) * SPEED_RAMP_UP;
        } else if (isBraking) {
          next = s * (1 - BRAKE_POWER);
        } else {
          next = s * (1 - SPEED_RAMP_DOWN); // natural decel
        }
        return Math.max(0, Math.min(SPEED_TARGET_MPH, next));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isAccelerating, isBraking]);

  // HUD Gauge Math
  const gaugeProgress = speed / SPEED_TARGET_MPH;
  const dashRef = useRef(100 * Math.PI * 2);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-[#020005] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Simulation Canvas */}
      <div className="absolute inset-0">
        <Canvas gl={{ antialias: false }}>
          <Suspense fallback={null}>
            <TestDriveScene speed={speed} isAccelerating={isAccelerating} isBraking={isBraking} />
          </Suspense>
        </Canvas>
      </div>

      {/* Cyberpunk Vignette/Motion Blur Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] mix-blend-multiply" />
      <div className="absolute inset-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {/* Top Bar Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/80">
            <Navigation className="w-4 h-4 text-[#ff0033]" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Simulator Active</span>
          </div>
          <span className="text-white/40 text-[9px] tracking-[0.2em] font-mono">SYS.911.GT3.RS // ONLINE</span>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-5 py-3 rounded-tr-2xl rounded-bl-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-white/90 hover:bg-[#ff0033]/20 hover:border-[#ff0033] hover:text-[#ff0033] transition-all pointer-events-auto"
        >
          <X className="w-3.5 h-3.5" />
          Abort Simulation
        </button>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">

        {/* Futuristic Dashboard Speedometer */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          {/* Glowing SVG Gauge */}
          <svg className="absolute inset-0 w-full h-full -rotate-135 transform drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]">
            {/* Background Track */}
            <circle cx="128" cy="128" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" strokeDasharray={`${dashRef.current * 0.75} ${dashRef.current * 0.25}`} strokeLinecap="round" />
            {/* Dynamic Fill */}
            <circle
              cx="128" cy="128" r="100"
              stroke="#ff0033" strokeWidth="8" fill="none"
              strokeDasharray={`${dashRef.current * 0.75} ${dashRef.current * 0.25}`}
              strokeDashoffset={dashRef.current * 0.75 * (1 - gaugeProgress)}
              strokeLinecap="round"
              className="transition-all duration-100 ease-linear"
            />
          </svg>

          {/* Speed Text */}
          <div className="flex flex-col items-center justify-center pt-4">
            <div className="text-[10px] uppercase tracking-[0.4em] text-[#ff0033] font-bold mb-1 opacity-80">SPD</div>
            <p
              className="font-orbitron text-7xl font-bold tabular-nums text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {Math.round(speed).toString().padStart(3, '0')}
            </p>
            <p className="text-[9px] tracking-[0.4em] uppercase text-white/40 mt-1 font-sans">
              MPH
            </p>
          </div>
        </div>

        {/* UI Controls */}
        <div className="flex gap-8 pointer-events-auto">
          {/* Brake Panel */}
          <button
            onPointerDown={() => setIsBraking(true)}
            onPointerUp={() => setIsBraking(false)}
            onPointerLeave={() => setIsBraking(false)}
            className={`relative overflow-hidden w-36 h-20 rounded-xl flex flex-col items-center justify-center border transition-all duration-200 ${isBraking ? 'bg-[#ff0033]/20 border-[#ff0033] shadow-[0_0_30px_rgba(255,0,51,0.4)]' : 'bg-black/60 border-white/10 hover:bg-black/80 backdrop-blur-xl'}`}
          >
            <span className={`text-[11px] uppercase tracking-[0.3em] font-bold transition-colors ${isBraking ? 'text-[#ff0033]' : 'text-white/80'}`}>Brake</span>
            <span className="text-white/30 text-[9px] tracking-[0.4em] mt-2 font-mono">SYS.BRK [S]</span>
            {isBraking && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff0033] shadow-[0_0_10px_#ff0033]" />}
          </button>

          {/* Accelerate Panel */}
          <button
            onPointerDown={() => setIsAccelerating(true)}
            onPointerUp={() => setIsAccelerating(false)}
            onPointerLeave={() => setIsAccelerating(false)}
            className={`relative overflow-hidden w-36 h-20 rounded-xl flex flex-col items-center justify-center border transition-all duration-200 ${isAccelerating ? 'bg-[#00ffd5]/20 border-[#00ffd5] shadow-[0_0_30px_rgba(0,255,213,0.4)]' : 'bg-black/60 border-white/10 hover:bg-black/80 backdrop-blur-xl'}`}
          >
            <span className={`text-[11px] uppercase tracking-[0.3em] font-bold transition-colors ${isAccelerating ? 'text-[#00ffd5]' : 'text-white/80'}`}>Accel</span>
            <span className="text-white/30 text-[9px] tracking-[0.4em] mt-2 font-mono">SYS.THR [W]</span>
            {isAccelerating && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00ffd5] shadow-[0_0_10px_#00ffd5]" />}
          </button>
        </div>

        {/* Floating Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-10 text-[10px] tracking-[0.3em] uppercase text-white/50 backdrop-blur-md bg-black/40 px-4 py-2 rounded-full border border-white/5"
            >
              Hold W to Accelerate · S to Brake
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};

export default TestDriveOverlay;
