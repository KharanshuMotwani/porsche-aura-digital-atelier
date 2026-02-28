import { useCallback, useRef } from "react";

const createEngineSound = (ctx: AudioContext, type: "rev" | "idle" | "start") => {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const subOsc = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const subGain = ctx.createGain();
  const masterGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  

  filter.type = "lowpass";
  osc1.connect(filter);
  osc2.connect(filter);
  subOsc.connect(subGain);
  subGain.connect(masterGain);
  filter.connect(gain1);
  gain1.connect(masterGain);
  masterGain.connect(ctx.destination);

  const t = ctx.currentTime;

  if (type === "rev") {
    osc1.type = "sawtooth";
    osc2.type = "square";
    subOsc.type = "sine";

    osc1.frequency.setValueAtTime(45, t);
    osc1.frequency.exponentialRampToValueAtTime(260, t + 0.2);
    osc1.frequency.exponentialRampToValueAtTime(160, t + 0.7);
    osc1.frequency.exponentialRampToValueAtTime(70, t + 1.5);

    osc2.frequency.setValueAtTime(90, t);
    osc2.frequency.exponentialRampToValueAtTime(520, t + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(320, t + 0.7);
    osc2.frequency.exponentialRampToValueAtTime(140, t + 1.5);

    subOsc.frequency.setValueAtTime(30, t);
    subOsc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 1.5);

    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(4000, t + 0.2);
    filter.frequency.exponentialRampToValueAtTime(300, t + 1.5);
    filter.Q.setValueAtTime(4, t);

    subGain.gain.setValueAtTime(0.12, t);
    subGain.gain.linearRampToValueAtTime(0, t + 1.5);

    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    masterGain.gain.linearRampToValueAtTime(0.07, t + 0.3);
    masterGain.gain.linearRampToValueAtTime(0.02, t + 1.0);
    masterGain.gain.linearRampToValueAtTime(0, t + 1.5);

    osc1.start(t); osc2.start(t); subOsc.start(t);
    osc1.stop(t + 1.5); osc2.stop(t + 1.5); subOsc.stop(t + 1.5);
  } else if (type === "start") {
    osc1.type = "sawtooth";
    osc2.type = "triangle";
    subOsc.type = "sine";

    osc1.frequency.setValueAtTime(30, t);
    osc1.frequency.exponentialRampToValueAtTime(90, t + 0.6);
    osc2.frequency.setValueAtTime(60, t);
    osc2.frequency.exponentialRampToValueAtTime(180, t + 0.6);
    subOsc.frequency.setValueAtTime(20, t);
    subOsc.frequency.exponentialRampToValueAtTime(50, t + 0.6);

    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
    filter.Q.setValueAtTime(2, t);

    subGain.gain.setValueAtTime(0.1, t);
    subGain.gain.linearRampToValueAtTime(0, t + 1.2);

    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(0.08, t + 0.1);
    masterGain.gain.linearRampToValueAtTime(0.04, t + 0.6);
    masterGain.gain.linearRampToValueAtTime(0, t + 1.2);

    osc1.start(t); osc2.start(t); subOsc.start(t);
    osc1.stop(t + 1.2); osc2.stop(t + 1.2); subOsc.stop(t + 1.2);
  } else {
    osc1.type = "sawtooth";
    osc2.type = "triangle";
    subOsc.type = "sine";

    osc1.frequency.setValueAtTime(45, t);
    osc2.frequency.setValueAtTime(90, t);
    subOsc.frequency.setValueAtTime(25, t);

    filter.frequency.setValueAtTime(250, t);
    filter.Q.setValueAtTime(3, t);

    subGain.gain.setValueAtTime(0.08, t);
    subGain.gain.linearRampToValueAtTime(0, t + 2.5);

    masterGain.gain.setValueAtTime(0.03, t);
    masterGain.gain.linearRampToValueAtTime(0, t + 2.5);

    osc1.start(t); osc2.start(t); subOsc.start(t);
    osc1.stop(t + 2.5); osc2.stop(t + 2.5); subOsc.stop(t + 2.5);
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
