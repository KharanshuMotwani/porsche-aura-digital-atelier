import { useEffect, useRef } from "react";

export default function RainEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: { x: number; y: number; l: number; xs: number; ys: number; opacity: number }[] = [];
        const ripples: { x: number; y: number; r: number; a: number; maxR: number }[] = [];
        const maxParticles = 200;
        const maxRipples = 15;

        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                l: Math.random() * 15 + 5, // length
                xs: -3 + Math.random() * 2, // x speed
                ys: Math.random() * 15 + 15, // y speed
                opacity: Math.random() * 0.3 + 0.1
            });
        }

        const createRipple = (x: number, y: number) => {
            if (ripples.length < maxRipples) {
                ripples.push({
                    x, y,
                    r: 0,
                    a: 0.3,
                    maxR: 20 + Math.random() * 30
                });
            }
        };

        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Rain particles
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
                ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
                ctx.stroke();

                p.x += p.xs;
                p.y += p.ys;

                if (p.x > width || p.y > height) {
                    // Create ripple occasionally when hitting bottom half (simulating road)
                    if (p.y > height * 0.7 && Math.random() > 0.95) {
                        createRipple(p.x, height * (0.7 + Math.random() * 0.3));
                    }
                    p.x = Math.random() * width;
                    p.y = -20;
                }
            }

            // Draw Ripples
            ctx.lineWidth = 1;
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${r.a})`;
                ctx.stroke();

                r.r += 0.5;
                r.a -= 0.005;

                if (r.a <= 0 || r.r >= r.maxR) {
                    ripples.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ mixBlendMode: 'screen', opacity: 0.8 }}
        />
    );
}
