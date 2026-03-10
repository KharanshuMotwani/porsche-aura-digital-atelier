import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, useProgress, Html } from "@react-three/drei";
import { useScroll, useTransform } from "framer-motion";
import { motion as motion3d } from "framer-motion-3d";
import { motion } from "framer-motion";
import * as THREE from "three";

function Loader() {
    const { progress } = useProgress();
    return <Html center className="text-white text-sm whitespace-nowrap">{progress.toFixed(0)} % loaded</Html>;
}

const COLORS = [
    { name: "Silver", value: "#c0c0c0" },
    { name: "Deep Red", value: "#8b0000" },
    { name: "Racing Yellow", value: "#ffcc00" },
    { name: "Miami Blue", value: "#00a2e8" },
    { name: "Jet Black Metallic", value: "#111111" },
    { name: "Carrara White", value: "#f5f5f5" },
];

/* ═══════════════════════════════════════════════════════════
   918 SPYDER — local GLB
   ═══════════════════════════════════════════════════════════ */

function Car918({ color }: { color: string }) {
    const { scene, materials } = useGLTF("/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb") as any;

    useEffect(() => {
        if (materials && materials["Body_Paint_-_GT_Silver_Metalic"]) {
            materials["Body_Paint_-_GT_Silver_Metalic"].color.set(color);
            materials["Body_Paint_-_GT_Silver_Metalic"].needsUpdate = true;
        }
    }, [color, materials]);

    return <primitive object={scene} />;
}

/* ═══════════════════════════════════════════════════════════
   911 GT3 RS — local GLB with color customization
   ═══════════════════════════════════════════════════════════ */

function Car911({ color }: { color: string }) {
    const { scene, materials } = useGLTF("/car2/2012 Porsche 911 GT3 RS 4_0.glb") as any;
    const paintMats = useRef<THREE.MeshStandardMaterial[]>([]);
    const targetColor = useRef(new THREE.Color(color));
    const currentColor = useRef(new THREE.Color(color));

    // Identify body/paint materials on first load
    useEffect(() => {
        if (!materials) return;
        const paints: THREE.MeshStandardMaterial[] = [];
        Object.keys(materials).forEach((key) => {
            const mat = materials[key] as THREE.MeshStandardMaterial;
            const k = key.toLowerCase();
            if (
                k.includes("body") || k.includes("paint") || k.endsWith("_ext") ||
                k.includes("carpaint") || k.includes("car_paint") || k.includes("shell")
            ) {
                mat.metalness = 0.9;
                mat.roughness = 0.15;
                mat.envMapIntensity = 1.8;
                mat.color.set(color);

                // Keep the baked texture map, but blend it perfectly with the custom paint color.
                // Screen blend preserves white decals (GT3 RS stripe) while painting over the black body.
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
        });
        paintMats.current = paints;
    }, [materials]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update target when color prop changes
    useEffect(() => { targetColor.current.set(color); }, [color]);

    // Smooth per-frame color lerp
    useFrame((_, delta) => {
        currentColor.current.lerp(targetColor.current, Math.min(delta * 4, 1));
        paintMats.current.forEach((mat) => {
            mat.color.copy(currentColor.current);
        });
    });

    return <primitive object={scene} />;
}

/* ═══════════════════════════════════════════════════════════
   CAR ENTRIES
   ═══════════════════════════════════════════════════════════ */

type CarEntry = {
    name: string;
    subtitle: string;
    glb: string;
    Component: React.FC<{ color: string }>;
};

const CARS: CarEntry[] = [
    {
        name: "918 Spyder",
        subtitle: "Hybrid Hypercar",
        glb: "/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb",
        Component: Car918,
    },
    {
        name: "911 GT3 RS",
        subtitle: "Track-Bred Performance",
        glb: "/car2/2012 Porsche 911 GT3 RS 4_0.glb",
        Component: Car911,
    },
];

export default function CarModelViewer({
    hideUI = false,
    defaultCar = 0,
    autoRotate = false
}: {
    hideUI?: boolean;
    defaultCar?: number;
    autoRotate?: boolean;
} = {}) {
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
    const [activeCar, setActiveCar] = useState(defaultCar);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const car = CARS[activeCar];
    const CarComponent = car.Component;

    // Scroll 1: Rotate car 10-15 degrees
    const carRotationY = useTransform(scrollYProgress, [0.3, 0.6], [0, Math.PI / 12]);
    // Scroll 2: Camera panning slightly 
    const cameraPositionX = useTransform(scrollYProgress, [0.5, 0.8], [4, 2]);
    const cameraPositionZ = useTransform(scrollYProgress, [0.5, 0.8], [6, 8]);
    // Scroll 3: Lights glow and UI reveal
    const tailLightGlow = useTransform(scrollYProgress, [0.7, 0.9], [0, 5]);

    // Custom controller to inject framer-motion scroll values into the R3F canvas loop
    const ScrollController = () => {
        const { camera } = useThree();
        useFrame(() => {
            // Smoothly apply scroll driven transforms
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraPositionX.get(), 0.05);
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraPositionZ.get(), 0.05);
            camera.lookAt(0, 0, 0);
        });
        return null; // Logic only
    };

    return (
        <section ref={containerRef} className="relative w-full min-h-[150vh] bg-background">
            <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Section header */}
                {!hideUI && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="absolute top-16 inset-x-0 z-10 flex flex-col items-center gap-3"
                    >
                        <span className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground">
                            Build Your Porsche · Drag to rotate
                        </span>

                        {/* Car selector tabs */}
                        <div className="flex gap-3">
                            {CARS.map((c, i) => (
                                <button
                                    key={c.name}
                                    onClick={() => { setActiveCar(i); setSelectedColor(COLORS[0].value); }}
                                    className={`px-5 py-2 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold transition-all duration-300 cursor-pointer ${activeCar === i
                                        ? "bg-white text-black shadow-md scale-105"
                                        : "bg-white/10 text-white/60 hover:bg-white/20 hover:scale-[1.03]"
                                        }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>

                        {/* Subtitle */}
                        <span className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground/60 font-light">
                            {car.subtitle}
                        </span>
                    </motion.div>
                )}

                <div className={`relative w-full flex-1 flex flex-col items-center justify-center px-4 ${hideUI ? '' : 'mt-24 pb-12'}`}>
                    <div className={`w-full max-w-7xl ${hideUI ? 'h-screen' : 'h-[70vh] min-h-[400px]'}`}>
                        <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [4, 2, 6] }}>
                            <Suspense fallback={<Loader />}>
                                <ScrollController />
                                <PresentationControls speed={1.5} global zoom={0.8} polar={[-0.1, Math.PI / 4]}>
                                    <Stage environment="dawn" shadows={{ type: 'contact', opacity: 0.8, blur: 2 }}>
                                        <motion3d.group rotation-y={carRotationY} animate={{ rotateY: autoRotate ? [0, Math.PI * 2] : 0 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                                            <CarComponent color={selectedColor} />
                                        </motion3d.group>
                                    </Stage>
                                </PresentationControls>
                            </Suspense>
                        </Canvas>
                    </div>

                    {/* Color selector */}
                    {!hideUI && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-wrap items-center justify-center gap-4 mt-8 z-10"
                        >
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-10 h-10 rounded-full transition-all duration-300 relative group cursor-pointer
                  ${selectedColor === color.value ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-background' : 'hover:scale-105 border border-white/10'}
                `}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}

useGLTF.preload("/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb");
useGLTF.preload("/car2/2012 Porsche 911 GT3 RS 4_0.glb");
