"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const COLS = 4;
const ROWS = 6;
const COUNT = COLS * ROWS;
const TILES = Array.from({ length: COUNT }, (_, i) => i);

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** covered -> the marble panel; scattered -> the puzzle; solved -> the photo. */
type Stage = "covered" | "scattered" | "solved";

/**
 * A fixed shuffle of the cells. Seeded rather than Math.random so the picture
 * always breaks apart the same way — a jumble that rearranges itself on every
 * shuffle reads as noise rather than as one object coming apart.
 */
function shuffledCells(): number[] {
  const cells = TILES.slice();
  let seed = 20270211;
  for (let i = cells.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

const SCRAMBLE = shuffledCells();

/**
 * Where tile `index` sits while the puzzle is jumbled: squarely in another
 * tile's cell, offset by whole cells so nothing drifts outside the frame.
 */
function displaced(index: number) {
  const at = SCRAMBLE[index];
  return {
    xPercent: ((at % COLS) - (index % COLS)) * 100,
    yPercent: (Math.floor(at / COLS) - Math.floor(index / COLS)) * 100,
    // Just enough tilt and shrink to read as loose pieces rather than a grid.
    rotation: ((index % 7) - 3) * 1.2,
    scale: 0.93,
  };
}

const HOME = { xPercent: 0, yPercent: 0, rotation: 0, scale: 1 };

/**
 * Pietra dura: a photograph set into marble, uncovered and then assembled.
 *
 * Three stages. It arrives as a plain marble panel; scrolling to it lifts
 * every face off and lets the pieces fall out of order; a tap slides them
 * home and the photograph closes up. Each piece shows its own slice of the
 * picture once uncovered — the puzzle is that they are in each other's
 * places, not that they are face down.
 *
 * The markup is the finished picture, with the covers laid over it by script
 * before the first paint, so a page without JavaScript simply shows the
 * photograph rather than a blank grid.
 */
export default function InlayMosaic({ src, alt }: { src: string; alt: string }) {
  const root = useRef<HTMLElement>(null);
  const busy = useRef(false);
  const [stage, setStage] = useState<Stage>("solved");

  useIsoLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    setStage("covered");

    const ctx = gsap.context(() => {
      // The pieces are jumbled from the outset, behind the covers. Scattering
      // them only once the covers had lifted meant the finished photograph
      // flashed up for a moment and then fell apart.
      gsap.set("[data-cover]", { opacity: 1, scale: 1 });
      TILES.forEach((index) => gsap.set(`[data-tile="${index}"]`, displaced(index)));

      gsap.to("[data-cover]", {
        opacity: 0,
        scale: 0.72,
        duration: 0.6,
        ease: "power2.out",
        stagger: { grid: [ROWS, COLS], from: "center", amount: 0.9 },
        scrollTrigger: { trigger: node, start: "top 72%", once: true },
        onComplete: () => setStage("scattered"),
      });
    }, node);

    return () => ctx.revert();
  }, []);

  const toggle = useCallback(() => {
    const node = root.current;
    if (!node || busy.current || stage === "covered") return;
    busy.current = true;

    const solving = stage !== "solved";
    setStage(solving ? "solved" : "scattered");

    const tiles = gsap.utils.toArray<HTMLElement>(node.querySelectorAll("[data-tile]"));
    const tl = gsap.timeline({ onComplete: () => (busy.current = false) });

    if (solving) {
      tl.to(tiles, {
        ...HOME,
        duration: 1.35,
        // A small overshoot, as though each piece were pressed into place.
        ease: "back.out(1.4)",
        // Spread wide: watching each piece find its own place is the whole
        // point, and a quick snap reads as a transition rather than a solve.
        stagger: { grid: [ROWS, COLS], from: "random", amount: 3.2 },
      });
    } else {
      tiles.forEach((tile, index) => {
        tl.to(tile, { ...displaced(index), duration: 0.7, ease: "power2.in" }, index * 0.02);
      });
    }
  }, [stage]);

  const playable = stage !== "covered";

  return (
    <section ref={root} className="bg-background py-20">
      <div className="mx-auto max-w-sm px-6 text-center">
        <button
          type="button"
          onClick={toggle}
          disabled={!playable}
          aria-label={stage === "solved" ? "Scatter the pieces" : "Put the picture together"}
          className={`block w-full rounded-xl ${stage === "scattered" ? "cursor-pointer" : ""}`}
        >
          <div
            role="img"
            aria-label={alt}
            className="relative grid aspect-[5/6] w-full overflow-hidden rounded-xl border border-gold/35 bg-[#efe6d5]"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            }}
          >
            {TILES.map((index) => {
              const col = index % COLS;
              const row = Math.floor(index / COLS);
              return (
                <span
                  key={index}
                  data-tile={index}
                  className="block h-full w-full"
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                    backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
                  }}
                />
              );
            })}

            {/* A separate layer, so the marble stays a tidy panel while the
                pieces underneath are already in each other's places. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              }}
            >
              {TILES.map((index) => (
                <span key={index} data-cover className="inlay-cover opacity-0">
                  <span className="inlay-pip" />
                </span>
              ))}
            </span>

            {stage === "scattered" && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2"
              >
                {/* Two rings, half a cycle apart, so one is always travelling. */}
                <span className="tap-ping absolute inset-0 rounded-full border border-gold" />
                <span
                  className="tap-ping absolute inset-0 rounded-full border border-gold"
                  style={{ animationDelay: "1.2s" }}
                />
                <span className="tap-dot absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_12px_2px_rgb(213_161_60/0.6)]" />
              </span>
            )}
          </div>
        </button>
      </div>
    </section>
  );
}
