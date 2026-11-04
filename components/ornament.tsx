"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The gold flourish that separates sections. Its strokes draw themselves
 * outward from the centre the first time it scrolls into view — one
 * stroke-dashoffset transition per path, so there is no per-frame work.
 */
export default function Ornament({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
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
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 40"
      aria-hidden="true"
      className={`ornament ${drawn ? "is-drawn" : ""} ${className}`.trim()}
    >
      {/* Rules sweep out from the middle, so the motif leads the eye. */}
      <path className="stroke d1" d="M100 20 H8" />
      <path className="stroke d1" d="M140 20 H232" />
      <path className="stroke d2" d="M120 9 L131 20 L120 31 L109 20 Z" />
      <circle className="dot d3" cx="120" cy="20" r="2.6" />
      <circle className="dot d3" cx="100" cy="20" r="1.7" />
      <circle className="dot d3" cx="140" cy="20" r="1.7" />
    </svg>
  );
}
