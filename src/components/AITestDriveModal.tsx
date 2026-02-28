import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, Loader2 } from "lucide-react";

const FALLBACK_VIDEO_URL = "https://www.porschedriving.com/wp-content/uploads/2024/05/PCNA24-36483-Porschedriving-Site-Update_ATL_16x9.mp4";

type AITestDriveModalProps = {
  open: boolean;
  onClose: () => void;
};

const AITestDriveModal = ({ open, onClose }: AITestDriveModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [videoError, setVideoError] = useState(false);
  const [generating, setGenerating] = useState(false);

  const envUrl = typeof import.meta.env !== "undefined" && (import.meta.env as Record<string, string>).VITE_AI_TEST_DRIVE_VIDEO_URL;
  const defaultSrc = (envUrl && String(envUrl).trim()) || "/ai-test-drive.mp4";

  useEffect(() => {
    if (!open) return;
    setVideoError(false);
    setVideoSrc(defaultSrc);
  }, [open, defaultSrc]);

  const handleVideoError = () => {
    if (videoSrc !== FALLBACK_VIDEO_URL) {
      setVideoSrc(FALLBACK_VIDEO_URL);
      setVideoError(false);
    } else {
      setVideoError(true);
    }
  };

  const handleGenerateWithGemini = async () => {
    const apiUrl = typeof import.meta.env !== "undefined" && (import.meta.env as Record<string, string>).VITE_GEMINI_VIDEO_API_URL;
    if (!apiUrl) {
      setVideoSrc(FALLBACK_VIDEO_URL);
      setVideoError(false);
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Porsche 911 on a race track, POV driving simulation, cinematic, high speed",
        }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setVideoSrc(data.videoUrl);
        setVideoError(false);
      }
    } catch {
      setVideoSrc(FALLBACK_VIDEO_URL);
      setVideoError(false);
    } finally {
      setGenerating(false);
    }
  };

  const playFallback = () => {
    setVideoSrc(FALLBACK_VIDEO_URL);
    setVideoError(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden rounded-2xl glass-panel gold-border p-6 md:p-8 flex flex-col bg-black/40 backdrop-blur-md border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-white/10">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-light tracking-tight gold-text">
                AI Test Drive Simulation
              </h3>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Track simulation · Powered by Gemini
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground tracking-wider mb-4 shrink-0">
            Porsche 911 on-track simulation. AI-generated drive experience.
          </p>

          <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden bg-black/60 backdrop-blur-md border border-white/10">
            {videoError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Add <code className="text-xs bg-white/10 px-1 rounded">public/ai-test-drive.mp4</code> or set{" "}
                  <code className="text-xs bg-white/10 px-1 rounded">VITE_AI_TEST_DRIVE_VIDEO_URL</code>
                </p>
                <button
                  type="button"
                  onClick={playFallback}
                  className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
                >
                  Play sample simulation
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted={false}
                  playsInline
                  onError={handleVideoError}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 shrink-0 flex-wrap gap-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              AI-generated track simulation · Gemini
            </p>
            {typeof import.meta.env?.VITE_GEMINI_VIDEO_API_URL === "string" && (
              <button
                type="button"
                onClick={handleGenerateWithGemini}
                disabled={generating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate new with Gemini"
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AITestDriveModal;
