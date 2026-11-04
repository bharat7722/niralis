"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The engraved border of a printed invitation: four hairlines with a scrolled
 * bracket at each corner.
 *
 * Built from positioned rules rather than one stretched SVG, so the corner
 * flourishes keep their proportions at any width — a single `preserveAspect
 * Ratio="none"` frame would smear them as the card changes shape.
 *
 * Deliberately rectangular. A ring of petals reads as rangoli; a ruled
 * rectangle reads as stationery, which is what an invitation is.
 */
const CORNERS = [
  { place: "left-0 top-0", rotate: 0 },
  { place: "right-0 top-0", rotate: 90 },
  { place: "right-0 bottom-0", rotate: 180 },
  { place: "left-0 bottom-0", rotate: 270 },
] as const;

export default function InvitationFrame({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setDrawn(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rule = "absolute bg-gold/55 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.32,1)]";
  const open = drawn ? "scale-100" : "scale-0";

  return (
    <div ref={root} aria-hidden="true" className={`${className} ${drawn ? "is-drawn" : ""}`}>
      {/* A card surface, so the invitation sits on paper rather than floating
          on the page. Barely lighter than the background on purpose — the
          soft shadow does the work, not the contrast. */}
      <span
        className={`absolute inset-0 rounded-[2px] bg-card shadow-[0_24px_60px_-40px_oklch(38%_0.1_12)] transition-opacity duration-1000 ${
          drawn ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* One pass of light across the foil as the border finishes drawing. */}
      {drawn && (
        <span
          className="polish-sweep pointer-events-none absolute inset-0"
          style={{ animationDelay: "650ms" }}
        />
      )}

      {/* Rules open outward from the middle of each edge. */}
      <span className={`${rule} inset-x-12 top-0 h-px origin-center ${open}`} />
      <span className={`${rule} inset-x-12 bottom-0 h-px origin-center ${open}`} />
      <span className={`${rule} inset-y-12 left-0 w-px origin-center ${open}`} />
      <span className={`${rule} inset-y-12 right-0 w-px origin-center ${open}`} />

      {CORNERS.map((corner) => (
        <svg
          key={corner.place}
          viewBox="0 0 56 56"
          className={`absolute h-10 w-10 ${corner.place} transition-all duration-700 ease-out ${
            drawn ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `rotate(${corner.rotate}deg) scale(${drawn ? 1 : 0.6})`,
            transitionDelay: drawn ? "500ms" : "0ms",
          }}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* The bracket itself. */}
          <path d="M1 26 L1 7 Q1 1 7 1 L26 1" />
          {/* An inner rule, the way engraved borders are doubled. */}
          <path d="M8 30 L8 13 Q8 8 13 8 L30 8" opacity="0.5" />
          {/* A small curl closing the inner rule. */}
          <path d="M30 8 Q38 8 38 15 Q38 20 33 20 Q29 20 29 16" opacity="0.6" />
          <circle cx="4" cy="4" r="1.6" fill="var(--gold)" stroke="none" />
        </svg>
      ))}

      {/* A diamond centred on the top and bottom rules. */}
      {["top-0", "bottom-0"].map((edge) => (
        <span
          key={edge}
          className={`absolute left-1/2 ${edge} h-2 w-2 -translate-x-1/2 ${
            edge === "top-0" ? "-translate-y-1/2" : "translate-y-1/2"
          } rotate-45 border border-gold/70 bg-background transition-all duration-500 ease-out ${
            drawn ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
          style={{ transitionDelay: drawn ? "750ms" : "0ms" }}
        />
      ))}
    </div>
  );
}
