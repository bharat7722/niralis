"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const COLS = 5;
const ROWS = 6;
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => i);

/**
 * Pietra dura: a photograph set into marble, revealed tile by tile as the
 * guest scrolls.
 *
 * The flip runs outward from the middle using GSAP's grid stagger, which
 * knows the tiles' row/column layout and so can order them by distance from
 * the centre — doing that by hand would mean computing the distance for
 * every tile. Only rotateY animates.
 */
export default function InlayMosaic({ src, alt }: { src: string; alt: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-tile]", { rotateY: 0 });

      gsap.to("[data-tile]", {
        rotateY: 180,
        ease: "none",
        stagger: { grid: [ROWS, COLS], from: "center", amount: 0.85 },
        scrollTrigger: { trigger: node, start: "top 85%", end: "top 18%", scrub: 1 },
      });
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-background py-20">
      <div className="mx-auto max-w-sm px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Set in marble</p>
        <h2 data-varak className="mt-3 font-display text-4xl text-primary">
          Inlay
        </h2>

        <div
          role="img"
          aria-label={alt}
          className="mt-10 grid aspect-[5/6] w-full overflow-hidden rounded-xl border border-gold/35"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            perspective: 1200,
          }}
        >
          {TILES.map((index) => {
            const col = index % COLS;
            const row = Math.floor(index / COLS);
            return (
              <div
                key={index}
                data-tile
                className="relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span className="inlay-face inlay-front">
                  <span className="inlay-pip" />
                </span>
                <span
                  className="inlay-face"
                  style={{
                    transform: "rotateY(180deg)",
                    backgroundImage: `url(${src})`,
                    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                    backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
                  }}
                />
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">Scroll to turn the stone.</p>
      </div>
    </section>
  );
}
