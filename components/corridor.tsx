"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/site";

const LAYERS = [0, 1, 2, 3, 4, 5, 6];

const CX = 100;
const SPRING = 124; // where the arch leaves its columns
const RADIUS = 74;
const FLOOR = 258;
const CUSPS = 9;

/**
 * The multifoil inner edge of a Mughal arch: points stepped around a
 * semicircle, each span bowed back toward the centre so the lobes face
 * inward. A plain semicircle reads as a rainbow; the scalloping is what
 * makes it architecture.
 */
function cuspedArch(radius: number, depth: number): string {
  const points = Array.from({ length: CUSPS + 1 }, (_, i) => {
    const theta = Math.PI * (1 - i / CUSPS);
    return { x: CX + radius * Math.cos(theta), y: SPRING - radius * Math.sin(theta) };
  });

  let d = `M${(CX - radius).toFixed(1)} ${FLOOR} L${(CX - radius).toFixed(1)} ${SPRING}`;
  for (let i = 0; i < CUSPS; i++) {
    const a = points[i];
    const b = points[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = CX - mx;
    const dy = SPRING - my;
    const len = Math.hypot(dx, dy) || 1;
    const qx = mx + (dx / len) * depth;
    const qy = my + (dy / len) * depth;
    d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return `${d} L${(CX + radius).toFixed(1)} ${FLOOR}`;
}

const INNER = cuspedArch(RADIUS, 8.5);

/**
 * A receding line of palace arches the guest walks through by scrolling.
 *
 * Each arch grows from the floor line rather than from the middle of the box
 * — a doorway you approach widens upward and outward from the ground, and
 * anchoring the transform origin there is what sells the walk. They are
 * offset in time so several sit at different depths at once; one arch
 * expanding alone would read as a ripple, not a corridor.
 */
export default function Corridor() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const arches = gsap.utils.toArray<HTMLElement>("[data-arch]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: node, start: "top 92%", end: "bottom 25%", scrub: 1 },
      });

      arches.forEach((arch, index) => {
        const at = index * 0.15;
        tl.fromTo(arch, { scale: 0.18, opacity: 0 }, { scale: 0.8, opacity: 0.95, duration: 0.5 }, at)
          // Faded out well before the mask edge, so nothing is seen clipped.
          .to(arch, { scale: 2.1, opacity: 0, duration: 0.5 }, at + 0.5);
      });

      tl.fromTo("[data-floor]", { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 0.1)
        .fromTo("[data-glow]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3)
        .fromTo("[data-arch-text]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.95);
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-[92vh] overflow-hidden bg-paper">
      {/* Warm light at the far end, giving the corridor somewhere to lead. */}
      <div
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[46%] h-[42vh] w-[42vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 22%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="corridor-mask absolute inset-0">
        {LAYERS.map((layer) => (
          <svg
            key={layer}
            data-arch
            aria-hidden="true"
            viewBox="0 0 200 260"
            preserveAspectRatio="xMidYMax meet"
            className="absolute bottom-[20%] left-1/2 h-[48%] w-auto -translate-x-1/2 opacity-0"
            style={{ transformOrigin: "50% 100%" }}
            fill="none"
            stroke="var(--gold)"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Outer frame, then the scalloped opening inside it. */}
            <path
              d={`M${CX - RADIUS - 13} ${FLOOR} L${CX - RADIUS - 13} ${SPRING - 4}
                  C${CX - RADIUS - 13} ${SPRING - 62} ${CX - 42} ${SPRING - 104} ${CX} ${SPRING - 108}
                  C${CX + 42} ${SPRING - 104} ${CX + RADIUS + 13} ${SPRING - 62} ${CX + RADIUS + 13} ${SPRING - 4}
                  L${CX + RADIUS + 13} ${FLOOR}`}
              strokeWidth="1.8"
            />
            <path d={INNER} strokeWidth="0.9" opacity="0.6" />

            {/* Columns either side, and the keystone between them. */}
            <path d={`M${CX - RADIUS - 20} ${FLOOR} L${CX - RADIUS - 20} ${SPRING + 6}`} strokeWidth="1.1" opacity="0.5" />
            <path d={`M${CX + RADIUS + 20} ${FLOOR} L${CX + RADIUS + 20} ${SPRING + 6}`} strokeWidth="1.1" opacity="0.5" />
            <circle cx={CX} cy={SPRING - 96} r="3" fill="var(--gold)" stroke="none" opacity="0.8" />
            <circle cx={CX - RADIUS - 20} cy={SPRING + 6} r="2" fill="var(--gold)" stroke="none" opacity="0.45" />
            <circle cx={CX + RADIUS + 20} cy={SPRING + 6} r="2" fill="var(--gold)" stroke="none" opacity="0.45" />
          </svg>
        ))}

        <div
          data-floor
          aria-hidden="true"
          className="absolute inset-x-[6%] bottom-[20%] h-px origin-center bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        />
      </div>

      <div data-arch-text className="absolute inset-x-0 bottom-[28%] px-6 text-center opacity-0">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">Step inside</p>
        <p className="mt-3 font-display text-3xl text-primary sm:text-4xl">
          {site.groom} <span className="text-gold">&amp;</span> {site.bride}
        </p>
      </div>
    </section>
  );
}
