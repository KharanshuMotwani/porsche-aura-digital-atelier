import { useEffect, useRef, useState } from "react";

export function useAmbientAudio() {
    const [isPlaying, setIsPlaying] = useState(false);
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Note: We use synthetic base64/data URIs or just silences if actual assets are missing to prevent 404 console errors halting the experience
        // In a real env, these would map to valid public/ urls
        clickAudioRef.current = new Audio();
        clickAudioRef.current.volume = 0.4;

        // We can simulate a tick sound using AudioContext if we want, but let's stick to simple HTML Audio that fails gracefully
        try {
            clickAudioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"; // Tiny silent blank as placeholder to avoid 404
        } catch (e) { }

    }, []);

    const initAudio = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            // We would play the rain/engine idle here, but avoiding native 404s since we don't have the files
        }
    };

    const playClick = () => {
        if (clickAudioRef.current && isPlaying) {
            clickAudioRef.current.currentTime = 0;
            clickAudioRef.current.play().catch(() => { });
        }
    };

    return { initAudio, playClick, isPlaying };
}
