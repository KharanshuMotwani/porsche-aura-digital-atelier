import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const cinematicEase = [0.22, 1, 0.36, 1] as const;

interface PointerHotspotProps {
    title: string;
    subtitle?: string;
    top: string;
    left: string;
    lineDirection: 'left' | 'right';
    lineWidth: string;
    lineOffset?: 'top' | 'center' | 'bottom';
    hookDirection?: 'down' | 'up' | 'none';
    delay?: number;
    playClick?: () => void;
    tooltipText?: string;
    isOpen: boolean;
    onToggle: () => void;
}

export default function PointerHotspot({
    title, subtitle, top, left, lineDirection, lineWidth, lineOffset = "center", hookDirection = "none", delay = 0, playClick, tooltipText, isOpen, onToggle
}: PointerHotspotProps) {
    const [showSequence, setShowSequence] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSequence(true);
            if (playClick) {
                setTimeout(playClick, 600);
            }
        }, delay * 1000);
        return () => clearTimeout(timer);
    }, [delay, playClick]);

    useEffect(() => {
        if (isOpen && playClick) {
            playClick();
        }
    }, [isOpen, playClick]);

    if (!showSequence) return null;

    return (
        <div className="absolute z-30 pointer-events-auto" style={{ top, left, transform: 'translate(-50%, -50%)' }}>
            <div
                className="relative group flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
            >
                {/* Robotic Glowing circular marker */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isOpen ? 1.4 : 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                    className={`relative w-[22px] h-[22px] rounded-full bg-white/90 shadow-[0_0_15px_#fff] flex items-center justify-center z-10 border border-white transition-all ${isOpen ? 'ring-4 ring-white/20' : 'hover:scale-110'}`}
                >
                    <motion.div
                        animate={{ scale: isOpen ? [1, 2.5, 1] : [1, 1.4, 1], opacity: isOpen ? 0.6 : 0.4 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-white blur-md"
                    />
                    {/* Inner mechanical core */}
                    <div className={`w-[6px] h-[6px] rounded-full z-10 shadow-[inset_0_1px_3px_rgba(255,255,255,0.8)] transition-colors ${isOpen ? 'bg-amber-400' : 'bg-black'}`} />
                </motion.div>

                {/* Animated line and label container */}
                <div
                    className={`absolute pointer-events-none flex flex-col justify-end
            ${lineDirection === 'left' ? 'items-end right-1/2 mr-3' : 'items-start left-1/2 ml-3'}
            ${lineOffset === 'top' ? 'bottom-2' : lineOffset === 'bottom' ? 'top-3' : 'top-1/2 -translate-y-1/2'}
          `}
                >
                    {/* Label Text */}
                    <div className={`mb-1.5 flex flex-col overflow-hidden ${lineDirection === 'left' ? 'items-end' : 'items-start'}`}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6, ease: cinematicEase }}
                            className="text-[10px] md:text-[11px] font-bold text-white tracking-[0.1em] whitespace-nowrap leading-tight uppercase relative pb-1"
                            style={{ textShadow: "0 2px 5px rgba(0,0,0,0.9)" }}
                        >
                            {title}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/70 shadow-[0_0_5px_#fff]" />
                        </motion.div>

                        {subtitle && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.7, ease: cinematicEase }}
                                className="text-[9px] md:text-[10px] font-medium text-white/80 tracking-[0.1em] whitespace-nowrap leading-tight uppercase mt-0.5"
                                style={{ textShadow: "0 2px 5px rgba(0,0,0,0.9)" }}
                            >
                                {subtitle}
                            </motion.div>
                        )}

                        {/* Futuristic HUD Panel on Click */}
                        <AnimatePresence>
                            {isOpen && tooltipText && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0, height: 0 }}
                                    animate={{ opacity: 1, width: '280px', height: 'auto' }}
                                    exit={{ opacity: 0, width: 0, height: 0, transition: { duration: 0.3 } }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className={`absolute ${lineDirection === 'left' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} top-full mt-4 z-50 overflow-hidden rounded-lg`}
                                >
                                    {/* Scanning beam effect during open */}
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-10 mix-blend-screen pointer-events-none"
                                    />

                                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col gap-2 relative h-full w-full">
                                        {/* Futuristic Grid Pattern overlay */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
                                            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white m-0 leading-none drop-shadow-md">
                                                {title}
                                            </h4>
                                        </div>

                                        <p className="text-[10px] text-white/80 tracking-wide font-sans leading-relaxed m-0 text-left relative z-10 border-l border-white/20 pl-3 ml-0.5">
                                            {tooltipText}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Animated Connecting Line */}
                    <div className="flex flex-col relative" style={{ width: lineWidth }}>
                        <div className={`relative h-[1.5px] bg-white/60 overflow-hidden shadow-[0_0_5px_#fff] ${lineDirection === 'left' ? 'origin-right' : 'origin-left'}`}>
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.6, ease: cinematicEase, delay: 0.1 }}
                                className={`w-full h-full bg-white ${lineDirection === 'left' ? 'origin-right' : 'origin-left'}`}
                            />
                        </div>
                        {/* Hook end */}
                        {hookDirection !== 'none' && (
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.3, delay: 0.7, ease: cinematicEase }}
                                className={`w-[1.5px] h-4 bg-white/60 absolute shadow-[0_0_5px_#fff]
                 ${lineDirection === 'left' ? 'left-0 origin-top' : 'right-0 origin-top'} 
                 ${hookDirection === 'down' ? 'top-0' : 'bottom-0 origin-bottom'}
                `}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
