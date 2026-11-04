"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  w: number;
  h: number;
  color: string;
  sparkle: boolean;
};

const GOLD = ["#f6e3b0", "#e4bd63", "#d5a13c", "#c9962f"];
const PETAL = ["#ffc983", "#f3922a", "#e9802a"];
const DURATION = 4200;

/**
 * A one-shot shower of petals and gold flecks, mounted only once an RSVP has
 * actually been accepted. It runs on a single canvas with one rAF loop, stops
 * itself when the last flake leaves the screen, and never blocks a tap.
 */
export default function Celebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const size = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    // Fewer flakes on a phone: the screen is smaller, and so is the budget.
    const count = width < 640 ? 70 : 120;
    const flakes: Flake[] = Array.from({ length: count }, (_, i) => {
      const sparkle = i % 4 === 0;
      return {
        x: Math.random() * width,
        y: -Math.random() * height * 0.7 - 20,
        vx: (Math.random() - 0.5) * 1.1,
        vy: 1.4 + Math.random() * 2.2,
        spin: (Math.random() - 0.5) * 0.14,
        angle: Math.random() * Math.PI * 2,
        w: sparkle ? 2 + Math.random() * 2 : 6 + Math.random() * 6,
        h: sparkle ? 2 + Math.random() * 2 : 9 + Math.random() * 8,
        color: sparkle
          ? GOLD[Math.floor(Math.random() * GOLD.length)]
          : PETAL[Math.floor(Math.random() * PETAL.length)],
        sparkle,
      };
    });

    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - started;
      const fade = elapsed > DURATION - 900 ? Math.max(0, (DURATION - elapsed) / 900) : 1;

      ctx.clearRect(0, 0, width, height);

      let visible = 0;
      for (const flake of flakes) {
        flake.vy += 0.012;
        flake.x += flake.vx + Math.sin((now / 700) + flake.angle) * 0.5;
        flake.y += flake.vy;
        flake.angle += flake.spin;

        if (flake.y < height + 30) visible++;

        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.angle);
        ctx.globalAlpha = fade;
        ctx.fillStyle = flake.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, flake.w / 2, flake.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (visible > 0 && elapsed < DURATION) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
        frame = 0;
      }
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", size, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  );
}
