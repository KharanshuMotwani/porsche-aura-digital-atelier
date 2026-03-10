import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, useProgress, Html, Environment, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const COLORS = [
    { name: "Jet Black", value: "#1a1a1a" },
    { name: "Guards Red", value: "#cc0000" },
    { name: "Racing Yellow", value: "#f5c800" },
    { name: "Miami Blue", value: "#00a2e8" },
    { name: "GT Silver", value: "#b8b8b8" },
    { name: "Arctic White", value: "#f2f2f2" },
    { name: "Metallic Gold", value: "#c5a648" },
];

const WHEELS = [
    { name: "Carrera S" },
    { name: "RS Spyder" },
];

const WHEEL_COLORS = [
    { name: "Silver", value: "#b8b8b8" },
    { name: "Black", value: "#1a1a1a" },
    { name: "Gunmetal", value: "#454545" },
    { name: "Gold", value: "#b89b4a" },
];

/* ═══════════════════════════════════════════════════════════
   LOADER
   ═══════════════════════════════════════════════════════════ */

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 border-2 border-black/10 border-t-black rounded-full animate-spin mb-4" />
                <span className="text-black/40 text-[10px] tracking-[0.3em] uppercase font-sans">
                    Loading {progress.toFixed(0)}%
                </span>
            </div>
        </Html>
    );
}

/* ═══════════════════════════════════════════════════════════
   3D CAR MODEL 918 SPYDER
   ═══════════════════════════════════════════════════════════ */

function Car918Model({
    color,
    wheelColor,
    headlightsOn,
    wheelSpinning,
}: {
    color: string;
    wheelColor: string;
    headlightsOn: boolean;
    wheelSpinning: boolean;
}) {
    const { scene, materials } = useGLTF("/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb") as any;
    const groupRef = useRef<THREE.Group>(null);

    // Smooth color lerp targets
    const targetPaintColor = useRef(new THREE.Color(color));
    const currentPaintColor = useRef(new THREE.Color(color));
    const targetWheelColor = useRef(new THREE.Color(wheelColor));
    const currentWheelColor = useRef(new THREE.Color(wheelColor));

    // Track material refs for per-frame lerping
    const paintMats = useRef<THREE.MeshStandardMaterial[]>([]);
    const wheelMats = useRef<THREE.MeshStandardMaterial[]>([]);

    // Wheel spin state
    const spinSpeed = useRef(0);

    // Initialize materials on first load
    useEffect(() => {
        if (!materials) return;
        const paints: THREE.MeshStandardMaterial[] = [];
        const wheels: THREE.MeshStandardMaterial[] = [];

        Object.keys(materials).forEach((key) => {
            const mat = materials[key] as THREE.MeshStandardMaterial;
            const k = key.toLowerCase();

            if (k.includes("body") || k.includes("paint") || k.includes("carpaint") || k.includes("car_paint")) {
                // Premium metallic paint setup
                mat.metalness = 0.92;
                mat.roughness = 0.12;
                mat.envMapIntensity = 2.0;
                mat.color.set(color);
                paints.push(mat);
            }

            if (k.includes("rim") || k.includes("spoke") || k.includes("wheel") || k.includes("hub") || k.includes("disc") || k.includes("alloy")) {
                mat.metalness = 0.95;
                mat.roughness = 0.06;
                mat.envMapIntensity = 1.5;
                mat.color.set(wheelColor);
                wheels.push(mat);
            }

            if (k.includes("headlight") || k.includes("head_light")) {
                mat.emissive.set(headlightsOn ? "#ffffff" : "#000000");
                mat.emissiveIntensity = headlightsOn ? 8 : 0;
            }
        });

        paintMats.current = paints;
        wheelMats.current = wheels;
    }, [materials]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update targets when props change
    useEffect(() => { targetPaintColor.current.set(color); }, [color]);
    useEffect(() => { targetWheelColor.current.set(wheelColor); }, [wheelColor]);
    useEffect(() => {
        if (!materials) return;
        Object.keys(materials).forEach((key) => {
            const mat = materials[key] as THREE.MeshStandardMaterial;
            const k = key.toLowerCase();
            if (k.includes("headlight") || k.includes("head_light")) {
                mat.emissive.set(headlightsOn ? "#ffffff" : "#000000");
                mat.emissiveIntensity = headlightsOn ? 8 : 0;
            }
        });
    }, [headlightsOn, materials]);

    // Per-frame smooth interpolation
    useFrame((_, delta) => {
        // Smooth paint color lerp
        currentPaintColor.current.lerp(targetPaintColor.current, Math.min(delta * 4, 1));
        paintMats.current.forEach((mat) => {
            mat.color.copy(currentPaintColor.current);
        });

        // Smooth wheel color lerp
        currentWheelColor.current.lerp(targetWheelColor.current, Math.min(delta * 5, 1));
        wheelMats.current.forEach((mat) => {
            mat.color.copy(currentWheelColor.current);
        });

        // Wheel spin effect
        if (wheelSpinning) {
            spinSpeed.current = Math.min(spinSpeed.current + delta * 25, 20);
        } else {
            spinSpeed.current *= 0.92; // Decelerate smoothly
        }

        // Rotate wheel meshes (the scene's wheel children)
        if (spinSpeed.current > 0.01 && scene) {
            scene.traverse((child: any) => {
                if (child.isMesh) {
                    const n = child.name?.toLowerCase() || "";
                    if (n.includes("wheel") || n.includes("rim") || n.includes("tire") || n.includes("tyre")) {
                        child.rotation.x += delta * spinSpeed.current;
                    }
                }
            });
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={1.8} position={[0, 0, 0]} />
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════
   3D CAR MODEL 911 GT3 RS
   ═══════════════════════════════════════════════════════════ */

function Car911Model({
    color,
    wheelColor,
    headlightsOn,
    wheelSpinning,
}: {
    color: string;
    wheelColor: string;
    headlightsOn: boolean;
    wheelSpinning: boolean;
}) {
    const { scene, materials } = useGLTF("/car2/2012 Porsche 911 GT3 RS 4_0.glb") as any;
    const groupRef = useRef<THREE.Group>(null);

    const targetPaintColor = useRef(new THREE.Color(color));
    const currentPaintColor = useRef(new THREE.Color(color));
    const targetWheelColor = useRef(new THREE.Color(wheelColor));
    const currentWheelColor = useRef(new THREE.Color(wheelColor));

    const paintMats = useRef<THREE.MeshStandardMaterial[]>([]);
    const wheelMats = useRef<THREE.MeshStandardMaterial[]>([]);
    const spinSpeed = useRef(0);

    useEffect(() => {
        if (!materials) return;
        const paints: THREE.MeshStandardMaterial[] = [];
        const wheels: THREE.MeshStandardMaterial[] = [];

        Object.keys(materials).forEach((key) => {
            const mat = materials[key] as THREE.MeshStandardMaterial;
            const k = key.toLowerCase();

            if (k.includes("body") || k.includes("paint") || k.endsWith("_ext") ||
                k.includes("carpaint") || k.includes("car_paint") || k.includes("shell")) {
                mat.metalness = 0.9;
                mat.roughness = 0.15;
                mat.envMapIntensity = 1.8;
                mat.color.set(color);

                // Screen blend custom color over the baked black texture to preserve white decals
                mat.onBeforeCompile = (shader) => {
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <map_fragment>',
                        `
                        #ifdef USE_MAP
                            vec4 sampledDiffuseColor = texture2D( map, vMapUv );
                            diffuseColor.rgb = vec3(1.0) - (vec3(1.0) - diffuseColor.rgb) * (vec3(1.0) - sampledDiffuseColor.rgb);
                            diffuseColor.a *= sampledDiffuseColor.a;
                        #endif
                        `
                    );
                };
                mat.needsUpdate = true;
                paints.push(mat);
            }

            if (k.includes("rim") || k.includes("spoke") || k.includes("wheel") || k.includes("hub") || k.includes("alloy")) {
                mat.metalness = 0.95;
                mat.roughness = 0.06;
                mat.envMapIntensity = 1.5;
                mat.color.set(wheelColor);

                // Screen blend for wheels as well to preserve wheel details
                mat.onBeforeCompile = (shader) => {
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <map_fragment>',
                        `
                        #ifdef USE_MAP
                            vec4 sampledDiffuseColor = texture2D( map, vMapUv );
                            diffuseColor.rgb = vec3(1.0) - (vec3(1.0) - diffuseColor.rgb) * (vec3(1.0) - sampledDiffuseColor.rgb);
                            diffuseColor.a *= sampledDiffuseColor.a;
                        #endif
                        `
                    );
                };
                mat.needsUpdate = true;
                wheels.push(mat);
            }

            if (k.includes("light") || k.includes("glass")) {
                // Approximate headlights for the GT3 RS
                if (k.includes("glass") || !k.includes("light")) return;
                mat.emissive.set(headlightsOn ? "#ffffff" : "#000000");
                mat.emissiveIntensity = headlightsOn ? 5 : 0;
            }
        });

        paintMats.current = paints;
        wheelMats.current = wheels;
    }, [materials]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { targetPaintColor.current.set(color); }, [color]);
    useEffect(() => { targetWheelColor.current.set(wheelColor); }, [wheelColor]);
    useEffect(() => {
        if (!materials) return;
        Object.keys(materials).forEach((key) => {
            const mat = materials[key] as THREE.MeshStandardMaterial;
            const k = key.toLowerCase();
            if (k.includes("light")) {
                mat.emissive.set(headlightsOn ? "#ffffff" : "#000000");
                mat.emissiveIntensity = headlightsOn ? 5 : 0;
            }
        });
    }, [headlightsOn, materials]);

    useFrame((_, delta) => {
        currentPaintColor.current.lerp(targetPaintColor.current, Math.min(delta * 4, 1));
        paintMats.current.forEach((mat) => mat.color.copy(currentPaintColor.current));

        currentWheelColor.current.lerp(targetWheelColor.current, Math.min(delta * 5, 1));
        wheelMats.current.forEach((mat) => mat.color.copy(currentWheelColor.current));

        if (wheelSpinning) {
            spinSpeed.current = Math.min(spinSpeed.current + delta * 25, 20);
        } else {
            spinSpeed.current *= 0.92;
        }

        if (spinSpeed.current > 0.01 && scene) {
            scene.traverse((child: any) => {
                if (child.isMesh) {
                    const n = child.name?.toLowerCase() || "";
                    if (n.includes("wheel") || n.includes("rim") || n.includes("tire") || n.includes("tyre")) {
                        child.rotation.x += delta * spinSpeed.current;
                    }
                }
            });
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={1.8} position={[0, -0.1, 0]} />
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════
   SHOWROOM PLATFORM — with soft glow
   ═══════════════════════════════════════════════════════════ */

function ShowroomPlatform() {
    const glowRef = useRef<THREE.Mesh>(null);

    // Subtle pulsing glow animation
    useFrame((state) => {
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
        }
    });

    return (
        <group position={[0, -0.01, 0]}>
            {/* Main solid platform */}
            <mesh receiveShadow position={[0, -0.03, 0]}>
                <cylinderGeometry args={[4.5, 4.5, 0.05, 128]} />
                <meshStandardMaterial
                    color="#e9e9e9"
                    roughness={0.06}
                    metalness={0.25}
                    envMapIntensity={1.0}
                />
            </mesh>

            {/* Reflective glass-like top surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <circleGeometry args={[4.5, 128]} />
                <meshStandardMaterial
                    color="#f0f0f0"
                    roughness={0.02}
                    metalness={0.35}
                    transparent
                    opacity={0.5}
                    envMapIntensity={2.0}
                />
            </mesh>

            {/* Thin edge accent */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
                <ringGeometry args={[4.35, 4.5, 128]} />
                <meshStandardMaterial
                    color="#d4d4d4"
                    roughness={0.15}
                    metalness={0.6}
                />
            </mesh>

            {/* Soft radial glow under the platform */}
            <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
                <circleGeometry args={[5.5, 64]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.12}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════
   REFLECTION SWEEP LIGHT — moves across car every ~9s
   ═══════════════════════════════════════════════════════════ */

function ReflectionSweepLight() {
    const lightRef = useRef<THREE.SpotLight>(null);

    useFrame((state) => {
        if (!lightRef.current) return;
        // Sweep from left to right across the car, looping every ~9 seconds
        const t = state.clock.elapsedTime;
        const cycle = (t % 9) / 9; // 0 → 1 every 9 seconds
        const x = THREE.MathUtils.lerp(-8, 8, cycle);
        lightRef.current.position.set(x, 6, 2);
        // Fade in at start, fade out at end
        const fade = Math.sin(cycle * Math.PI);
        lightRef.current.intensity = fade * 0.8;
    });

    return (
        <spotLight
            ref={lightRef}
            angle={0.3}
            penumbra={1}
            color="#ffffff"
            castShadow={false}
            position={[-8, 6, 2]}
            intensity={0}
            target-position={[0, 0, 0]}
        />
    );
}

/* ═══════════════════════════════════════════════════════════
   CINEMATIC CAMERA INTRO
   ═══════════════════════════════════════════════════════════ */

function CinematicIntro({ onComplete }: { onComplete: () => void }) {
    const { camera } = useThree();
    const completed = useRef(false);

    useEffect(() => {
        camera.position.set(8, 3, 10);
        camera.lookAt(0, 0.5, 0);
    }, [camera]);

    useFrame((_, delta) => {
        if (completed.current) return;

        const target = new THREE.Vector3(4.5, 1.6, 6);
        camera.position.lerp(target, delta * 1.0);
        camera.lookAt(0, 0.5, 0);

        if (camera.position.distanceTo(target) < 0.08) {
            completed.current = true;
            onComplete();
        }
    });

    return null;
}

/* ═══════════════════════════════════════════════════════════
   MAIN CONFIGURATOR PAGE
   ═══════════════════════════════════════════════════════════ */

export default function Configurator() {
    const [activeModel, setActiveModel] = useState<"918 Spyder" | "911 GT3 RS">("918 Spyder");
    const [color, setColor] = useState(COLORS[4].value); // GT Silver default
    const [wheelType, setWheelType] = useState(WHEELS[0].name);
    const [wheelColor, setWheelColor] = useState(WHEEL_COLORS[0].value);
    const [headlightsOn, setHeadlightsOn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [wheelSpinning, setWheelSpinning] = useState(false);

    // Track active selections for UI feedback
    const [activeSelection, setActiveSelection] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        try {
            audioRef.current = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        } catch (_) { /* silent */ }
    }, []);

    const handleIntroComplete = () => {
        setIsReady(true);
        setHeadlightsOn(true);
        audioRef.current?.play().catch(() => { });
    };

    // Wheel type change triggers spin animation
    const handleWheelTypeChange = useCallback((name: string) => {
        setWheelType(name);
        setWheelSpinning(true);
        setActiveSelection(`wheel-${name}`);
        setTimeout(() => setWheelSpinning(false), 700);
        setTimeout(() => setActiveSelection(null), 400);
    }, []);

    // Selection flash
    const handleColorSelect = useCallback((value: string) => {
        setColor(value);
        setActiveSelection(`color-${value}`);
        setTimeout(() => setActiveSelection(null), 400);
    }, []);

    const handleWheelColorSelect = useCallback((value: string) => {
        setWheelColor(value);
        setWheelSpinning(true);
        setActiveSelection(`wcolor-${value}`);
        setTimeout(() => setWheelSpinning(false), 500);
        setTimeout(() => setActiveSelection(null), 400);
    }, []);

    const cinematicEase = [0.22, 1, 0.36, 1] as const;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-[#fafafa] to-[#e5e5e5] text-black font-sans overflow-hidden"
        >
            {/* ─── Top Bar ─── */}
            <header className="absolute top-0 w-full z-30 flex items-center px-8 py-5">
                <div className="flex-1">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors text-[10px] uppercase tracking-[0.15em] font-semibold"
                    >
                        <ChevronLeft size={14} /> Back
                    </Link>
                </div>
                <div className="text-[10px] uppercase tracking-[0.25em] pl-[0.25em] font-light text-black/25 text-center shrink-0">
                    Porsche Configurator
                </div>
                <div className="flex-1" />
            </header>

            {/* ─── Full-Screen 3D Canvas ─── */}
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 40, position: [8, 3, 10], near: 0.1, far: 100 }}
                className="absolute inset-0"
            >
                <color attach="background" args={["#f2f2f2"]} />

                {/* Studio Lighting */}
                <ambientLight intensity={0.35} />
                <spotLight position={[8, 10, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
                <spotLight position={[-6, 6, -3]} angle={0.25} penumbra={1} intensity={0.6} />
                <directionalLight position={[0, 3, -8]} intensity={0.5} color="#e8e0d0" />
                <directionalLight position={[-5, 2, 5]} intensity={0.25} color="#d8e0f0" />

                <Environment preset="studio" />

                {/* Reflection Sweep Light */}
                <ReflectionSweepLight />

                <Suspense fallback={<Loader />}>
                    {activeModel === "918 Spyder" ? (
                        <Car918Model color={color} wheelColor={wheelColor} headlightsOn={headlightsOn} wheelSpinning={wheelSpinning} />
                    ) : (
                        <Car911Model color={color} wheelColor={wheelColor} headlightsOn={headlightsOn} wheelSpinning={wheelSpinning} />
                    )}
                    <CinematicIntro onComplete={handleIntroComplete} />

                    <ContactShadows
                        position={[0, -0.02, 0]}
                        opacity={0.35}
                        scale={16}
                        blur={2.5}
                        far={5}
                    />

                    <ShowroomPlatform />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={12}
                    maxPolarAngle={Math.PI / 2.15}
                    minPolarAngle={0.3}
                    autoRotate={isReady}
                    autoRotateSpeed={0.3}
                    enableDamping
                    dampingFactor={0.05}
                    target={[0, 0.5, 0]}
                />
            </Canvas>

            {/* ─── Model Name Badge ─── */}
            <AnimatePresence>
                {isReady && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        transition={{ duration: 1, delay: 0.3, ease: cinematicEase }}
                        className="absolute top-20 left-1/2 text-center z-10 pointer-events-none"
                    >
                        <div className="text-[10px] uppercase tracking-[0.4em] pl-[0.4em] text-black/20 font-semibold mb-1">Porsche</div>
                        <div className="text-2xl md:text-3xl font-extralight tracking-[0.1em] pl-[0.1em] text-black/60">{activeModel}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Intro Reflection Sweep (one-shot on load) ─── */}
            <AnimatePresence>
                {isReady && (
                    <motion.div
                        initial={{ x: "-100%", opacity: 0.6 }}
                        animate={{ x: "200%", opacity: 0 }}
                        transition={{ duration: 1.5, delay: 0.1, ease: "easeInOut" }}
                        className="absolute inset-0 z-10 pointer-events-none"
                    >
                        <div className="w-32 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Premium Bottom Control Bar ─── */}
            <AnimatePresence>
                {isReady && (
                    <motion.div
                        initial={{ y: 80, opacity: 0, x: "-50%" }}
                        animate={{ y: 0, opacity: 1, x: "-50%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 150, delay: 0.6 }}
                        className="absolute bottom-6 left-1/2 z-20 w-[95%] max-w-5xl"
                    >
                        <div className="bg-white/75 backdrop-blur-2xl rounded-2xl border border-black/[0.04] shadow-[0_8px_40px_rgba(0,0,0,0.06)] px-6 py-4 flex items-center justify-between gap-4 overflow-x-auto">

                            {/* Car Model Selection */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold">Model</span>
                                <div className="flex bg-black/5 p-1 rounded-full">
                                    <button
                                        onClick={() => setActiveModel("918 Spyder")}
                                        className={`px-3 py-1.5 rounded-full text-[8px] tracking-[0.12em] uppercase font-bold transition-all duration-300 ${activeModel === "918 Spyder" ? "bg-white shadow-sm text-black" : "text-black/40 hover:text-black/60"}`}
                                    >
                                        918 Spyder
                                    </button>
                                    <button
                                        onClick={() => setActiveModel("911 GT3 RS")}
                                        className={`px-3 py-1.5 rounded-full text-[8px] tracking-[0.12em] uppercase font-bold transition-all duration-300 ${activeModel === "911 GT3 RS" ? "bg-white shadow-sm text-black" : "text-black/40 hover:text-black/60"}`}
                                    >
                                        911 GT3 RS
                                    </button>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-black/5 shrink-0" />

                            {/* Paint Colors */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold">Exterior</span>
                                <div className="flex items-center gap-2">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => handleColorSelect(c.value)}
                                            className={`w-6 h-6 rounded-full transition-all duration-300 ${color === c.value
                                                ? "ring-2 ring-black ring-offset-2 scale-[1.2]"
                                                : "border border-black/10 hover:scale-110"
                                                } ${activeSelection === `color-${c.value}` ? "shadow-[0_0_12px_rgba(0,0,0,0.2)]" : ""}`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                                <span className="text-[8px] text-black/30 font-medium tracking-wide">
                                    {COLORS.find((c) => c.value === color)?.name}
                                </span>
                            </div>

                            <div className="w-px h-10 bg-black/5 shrink-0" />

                            {/* Wheel Type */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold">Wheels</span>
                                <div className="flex gap-1.5">
                                    {WHEELS.map((w) => (
                                        <button
                                            key={w.name}
                                            onClick={() => handleWheelTypeChange(w.name)}
                                            className={`px-3 py-1 rounded-full text-[8px] tracking-[0.12em] uppercase font-semibold transition-all duration-300 ${wheelType === w.name
                                                ? "bg-black text-white shadow-md scale-105"
                                                : "bg-black/5 text-black/40 hover:bg-black/10"
                                                } ${activeSelection === `wheel-${w.name}` ? "shadow-[0_0_12px_rgba(0,0,0,0.3)]" : ""}`}
                                        >
                                            {w.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-px h-10 bg-black/5 shrink-0" />

                            {/* Wheel Color */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold">Rim Color</span>
                                <div className="flex gap-1.5">
                                    {WHEEL_COLORS.map((wc) => (
                                        <button
                                            key={wc.name}
                                            onClick={() => handleWheelColorSelect(wc.value)}
                                            className={`w-5 h-5 rounded-full transition-all duration-300 ${wheelColor === wc.value
                                                ? "ring-2 ring-black ring-offset-1 scale-[1.2]"
                                                : "border border-black/10 hover:scale-110"
                                                } ${activeSelection === `wcolor-${wc.value}` ? "shadow-[0_0_10px_rgba(0,0,0,0.25)]" : ""}`}
                                            style={{ backgroundColor: wc.value }}
                                            title={wc.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="w-px h-10 bg-black/5 shrink-0" />

                            {/* Headlight + Summary */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setHeadlightsOn(!headlightsOn)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${headlightsOn
                                        ? "bg-black text-white shadow-lg"
                                        : "bg-black/5 text-black/25 hover:bg-black/10"
                                        }`}
                                    title={headlightsOn ? "Headlights ON" : "Headlights OFF"}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setIsSummaryOpen(true)}
                                    className="px-5 py-2 bg-black text-white rounded-full text-[8px] tracking-[0.2em] uppercase font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
                                >
                                    Summary
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Sliding Summary Panel ─── */}
            <AnimatePresence>
                {isSummaryOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSummaryOpen(false)}
                            className="fixed inset-0 bg-black/15 backdrop-blur-sm z-40 cursor-pointer"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="p-10 flex-1 flex flex-col">
                                <button
                                    onClick={() => setIsSummaryOpen(false)}
                                    className="self-end text-black/15 hover:text-black transition-colors mb-8"
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>

                                <div className="flex-1 flex flex-col justify-center">
                                    <p className="text-[8px] uppercase tracking-[0.4em] text-black/20 font-bold mb-1 text-center">Your Configuration</p>
                                    <h1 className="text-3xl font-extralight tracking-tight text-center mb-14">{activeModel}</h1>

                                    <div className="space-y-6 max-w-xs mx-auto w-full">
                                        <div className="flex justify-between items-center border-b border-black/5 pb-3">
                                            <div>
                                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold block mb-0.5">Exterior</span>
                                                <span className="text-sm font-light">{COLORS.find((c) => c.value === color)?.name}</span>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: color }} />
                                        </div>
                                        <div className="flex justify-between items-center border-b border-black/5 pb-3">
                                            <div>
                                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold block mb-0.5">Wheels</span>
                                                <span className="text-sm font-light">{wheelType}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-black/5 pb-3">
                                            <div>
                                                <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold block mb-0.5">Rim Color</span>
                                                <span className="text-sm font-light">{WHEEL_COLORS.find((wc) => wc.value === wheelColor)?.name}</span>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: wheelColor }} />
                                        </div>
                                        <div className="pt-6">
                                            <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 font-bold block mb-1">Starting at</span>
                                            <span className="text-3xl font-extralight tabular-nums">{activeModel === "918 Spyder" ? "$845,000" : "$241,300"}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-3.5 bg-black text-white rounded-full text-[9px] tracking-[0.2em] uppercase font-bold hover:bg-zinc-800 transition-colors shadow-xl shadow-black/10">
                                    Place Order
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
