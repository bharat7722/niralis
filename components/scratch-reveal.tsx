"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScratchRevealProps = {
  children: React.ReactNode;
  /** Percentage of foil that must be cleared before the rest falls away on its own. */
  threshold?: number;
  hint?: string;
  subHint?: string;
  /** Keeps the card revealed while the guest browses other pages. */
  storageKey?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

const DUST = ["#fff6df", "#f6e3b0", "#e4bd63", "#d5a13c", "#bd8a2c"];
const MAX_PARTICLES = 520;

export default function ScratchReveal({
  children,
  threshold = 50,
  hint = "Scratch to reveal",
  subHint,
  storageKey = "hn-scratch-date",
}: ScratchRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const foilCtx = useRef<CanvasRenderingContext2D | null>(null);
  const dustCtx = useRef<CanvasRenderingContext2D | null>(null);

  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const drawing = useRef(false);
  const moves = useRef(0);
  const revealedRef = useRef(false);
  const size = useRef({ w: 0, h: 0 });

  const particles = useRef<Particle[]>([]);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);

  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const [animate, setAnimate] = useState(false);

  /* ----------------------------------------------------------------- dust */

  const tick = useCallback(() => {
    const ctx = dustCtx.current;
    if (!ctx) {
      raf.current = null;
      return;
    }

    const { w, h } = size.current;
    ctx.clearRect(0, 0, w, h);

    const alive: Particle[] = [];
    for (const p of particles.current) {
      p.life += 1;
      const t = p.life / p.maxLife;
      if (t >= 1) continue;

      p.vy += 0.13; // gravity, so the dust falls rather than drifts
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;

      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.45), 0, Math.PI * 2);
      ctx.fill();
      alive.push(p);
    }
    ctx.globalAlpha = 1;
    particles.current = alive;

    raf.current = alive.length ? requestAnimationFrame(tick) : null;
  }, []);

  const spawnDust = useCallback(
    (x: number, y: number, count: number, spread: number) => {
      if (reduced.current || particles.current.length > MAX_PARTICLES) return;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * spread;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.1,
          life: 0,
          maxLife: 28 + Math.random() * 26,
          size: 0.9 + Math.random() * 2.3,
          color: DUST[Math.floor(Math.random() * DUST.length)],
        });
      }
      if (raf.current === null) raf.current = requestAnimationFrame(tick);
    },
    [tick],
  );

  /* ----------------------------------------------------------------- foil */

  const paintFoil = useCallback(() => {
    const foil = foilRef.current;
    const dust = dustRef.current;
    const wrap = wrapRef.current;
    if (!foil || !dust || !wrap) return;

    const { width, height } = wrap.getBoundingClientRect();
    if (width < 1 || height < 1) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const canvas of [foil, dust]) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    size.current = { w: width, h: height };

    const dctx = dust.getContext("2d");
    if (dctx) {
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dustCtx.current = dctx;
    }

    const ctx = foil.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    foilCtx.current = ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // Base metal, then two specular bands running across the warm gold.
    ctx.fillStyle = "#d5a13c";
    ctx.fillRect(0, 0, width, height);

    const sheen = ctx.createLinearGradient(0, 0, width, height);
    sheen.addColorStop(0, "#c08f2e");
    sheen.addColorStop(0.18, "#e9cd8d");
    sheen.addColorStop(0.32, "#d5a13c");
    sheen.addColorStop(0.5, "#fbf0cf");
    sheen.addColorStop(0.68, "#d5a13c");
    sheen.addColorStop(0.84, "#edd49b");
    sheen.addColorStop(1, "#b8862a");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    // Woven lattice — reads as pressed foil rather than flat paint.
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(255 255 255 / 0.10)";
    ctx.beginPath();
    for (let x = -height; x < width + height; x += 14) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.moveTo(x, height);
      ctx.lineTo(x + height, 0);
    }
    ctx.stroke();

    // Deterministic speckle, so a resize repaint never flickers.
    ctx.fillStyle = "rgb(255 255 255 / 0.26)";
    for (let i = 0; i < 420; i++) {
      const x = ((i * 97) % Math.ceil(width)) + Math.sin(i) * 3;
      const y = ((i * 53) % Math.ceil(height)) + Math.cos(i) * 3;
      ctx.fillRect(x, y, 1.4, 1.4);
    }

    // Edges a touch darker, so the card looks lit from the middle.
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.2,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75,
    );
    vignette.addColorStop(0, "rgb(0 0 0 / 0)");
    vignette.addColorStop(1, "rgb(90 58 10 / 0.3)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Inset rule, the way an invitation card is bordered.
    ctx.strokeStyle = "rgb(120 78 18 / 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(11.5, 11.5, width - 23, height - 23);
    ctx.strokeStyle = "rgb(255 243 214 / 0.35)";
    ctx.strokeRect(14.5, 14.5, width - 29, height - 29);

    // Hint, flanked by two small diamonds.
    const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    const hasSpacing = typeof spaced.letterSpacing === "string";
    const cx = width / 2;
    const cy = height / 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (hasSpacing) spaced.letterSpacing = "0.32em";
    ctx.font = '600 12px "Jost", ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = "rgb(74 31 36 / 0.72)";
    const label = hint.toUpperCase();
    const labelY = subHint ? cy - 9 : cy;
    ctx.fillText(label, cx, labelY);

    const half = ctx.measureText(label).width / 2;
    ctx.fillStyle = "rgb(74 31 36 / 0.5)";
    for (const dx of [-half - 18, half + 14]) {
      ctx.save();
      ctx.translate(cx + dx, labelY);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    }

    if (subHint) {
      if (hasSpacing) spaced.letterSpacing = "0.18em";
      ctx.font = '400 10px "Jost", ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = "rgb(74 31 36 / 0.5)";
      ctx.fillText(subHint.toUpperCase(), cx, cy + 13);
    }
    if (hasSpacing) spaced.letterSpacing = "0px";
  }, [hint, subHint]);

  /* -------------------------------------------------------------- reveal */

  const reveal = useCallback(
    (withBurst: boolean) => {
      if (revealedRef.current) return;
      revealedRef.current = true;

      if (withBurst && !reduced.current) {
        const { w, h } = size.current;
        for (let i = 0; i < 26; i++) {
          spawnDust(w * (0.12 + Math.random() * 0.76), h * (0.2 + Math.random() * 0.6), 3, 5.5);
        }
        setAnimate(true);
      }

      setRevealed(true);
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // Private browsing — the card simply re-locks on the next visit.
      }
    },
    [spawnDust, storageKey],
  );

  /* ------------------------------------------------------------ scratching */

  const clearedPercent = useCallback(() => {
    const foil = foilRef.current;
    const ctx = foilCtx.current;
    if (!foil || !ctx) return 0;

    const { data } = ctx.getImageData(0, 0, foil.width, foil.height);
    let cleared = 0;
    let total = 0;
    // Sample every 32nd pixel — ample for a progress estimate, cheap mid-drag.
    for (let i = 3; i < data.length; i += 4 * 32) {
      if (data[i] < 24) cleared++;
      total++;
    }
    return total ? (cleared / total) * 100 : 0;
  }, []);

  const scratchTo = useCallback((x: number, y: number) => {
    const ctx = foilCtx.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 38;

    const from = lastPoint.current ?? { x, y };
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 19, 0, Math.PI * 2);
    ctx.fill();

    lastPoint.current = { x, y };
  }, []);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    lastPoint.current = null;
    setStarted(true);
    const { x, y } = pointFrom(event);
    scratchTo(x, y);
    spawnDust(x, y, 6, 3);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || revealedRef.current) return;
    const { x, y } = pointFrom(event);
    scratchTo(x, y);
    spawnDust(x, y, 3, 2.6);

    moves.current += 1;
    if (moves.current % 6 === 0 && clearedPercent() >= threshold) reveal(true);
  };

  const handlePointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    if (!revealedRef.current && clearedPercent() >= threshold) reveal(true);
  };

  /* ---------------------------------------------------------------- mount */

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let alreadyRevealed = false;
    try {
      alreadyRevealed = sessionStorage.getItem(storageKey) === "1";
    } catch {
      alreadyRevealed = false;
    }

    if (alreadyRevealed) {
      revealedRef.current = true;
      setRevealed(true);
      return;
    }

    paintFoil();

    const wrap = wrapRef.current;
    if (!wrap) return;

    const observer = new ResizeObserver(() => {
      if (revealedRef.current) return;
      if (Math.abs(wrap.getBoundingClientRect().width - size.current.w) > 1) paintFoil();
    });
    observer.observe(wrap);

    return () => {
      observer.disconnect();
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [paintFoil, storageKey]);

  /* ----------------------------------------------------------------- view */

  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        ref={wrapRef}
        className={`relative flex min-h-[16rem] items-center justify-center overflow-hidden rounded-3xl border border-gold/30 bg-card px-6 py-10 sm:px-10 ${
          revealed ? (animate ? "reveal-ring" : "") : "foil-glow"
        }`}
      >
        <div className={`w-full text-center ${animate ? "reveal-settle" : ""}`}>{children}</div>

        {animate && (
          <span aria-hidden="true" className="polish-sweep pointer-events-none absolute inset-0 z-30" />
        )}

        {!revealed && !started && (
          <span aria-hidden="true" className="foil-sheen pointer-events-none absolute inset-0 z-10" />
        )}

        <canvas
          ref={foilRef}
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute inset-0 h-full w-full touch-none transition-all duration-700 ease-out ${
            revealed
              ? "pointer-events-none z-0 scale-[1.03] opacity-0 blur-[3px]"
              : "z-20 cursor-grab opacity-100 active:cursor-grabbing"
          }`}
        />

        <canvas
          ref={dustRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 h-full w-full"
        />
      </div>

      <div
        className={`mt-3 h-4 transition-opacity duration-300 ${
          revealed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={() => reveal(true)}
          disabled={revealed}
          className="mx-auto block text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
        >
          or tap to reveal
        </button>
      </div>
    </div>
  );
}
