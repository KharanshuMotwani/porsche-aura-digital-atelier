import { useCallback, useRef } from "react";

const createEngineSound = (ctx: AudioContext, type: "rev" | "idle" | "start") => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === "rev") {
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(60, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    oscillator.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.2);
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 1.2);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04);
    gainNode.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.6);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.2);
  } else if (type === "start") {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(40, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);
  } else {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(55, ctx.currentTime);
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 2);
  }
};

export const useEngineSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  };

  const playRev = useCallback(() => {
    if (!enabledRef.current) return;
    try { createEngineSound(getCtx(), "rev"); } catch {}
  }, []);

  const playStart = useCallback(() => {
    if (!enabledRef.current) return;
    try { createEngineSound(getCtx(), "start"); } catch {}
  }, []);

  const playIdle = useCallback(() => {
    if (!enabledRef.current) return;
    try { createEngineSound(getCtx(), "idle"); } catch {}
  }, []);

  const setEnabled = useCallback((v: boolean) => { enabledRef.current = v; }, []);

  return { playRev, playStart, playIdle, setEnabled, enabledRef };
};
