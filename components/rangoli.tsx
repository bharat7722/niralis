"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { drawEnd, measure } from "@/lib/draw-on-scroll";

const CENTER = 200;
const FOLDS = 12;

/** Polar to cartesian, with 0° pointing straight up. */
function point(radius: number, degrees: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

function petalPath(index: number): string {
  const axis = (360 / FOLDS) * index;
  const [bx1, by1] = point(68, axis - 10);
  const [bx2, by2] = point(68, axis + 10);
  const [tx, ty] = point(166, axis);
  const [c1x, c1y] = point(122, axis - 23);
  const [c2x, c2y] = point(122, axis + 23);
  return `M${bx1.toFixed(1)} ${by1.toFixed(1)} Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${tx.toFixed(
    1,
  )} ${ty.toFixed(1)} Q${c2x.toFixed(1)} ${c2y.toFixed(1)} ${bx2.toFixed(1)} ${by2.toFixed(1)}`;
}

function innerPath(index: number): string {
  const axis = (360 / FOLDS) * index + 15;
  const [bx1, by1] = point(26, axis - 16);
  const [bx2, by2] = point(26, axis + 16);
  const [tx, ty] = point(62, axis);
  const [c1x, c1y] = point(46, axis - 26);
  const [c2x, c2y] = point(46, axis + 26);
  return `M${bx1.toFixed(1)} ${by1.toFixed(1)} Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${tx.toFixed(
    1,
  )} ${ty.toFixed(1)} Q${c2x.toFixed(1)} ${c2y.toFixed(1)} ${bx2.toFixed(1)} ${by2.toFixed(1)}`;
}

/**
 * A twelve-fold rangoli that the guest draws by scrolling. Every stroke is a
 * dash offset animated to zero — no per-frame geometry, so a phone only has
 * to repaint a handful of thin paths.
 */
export default function Rangoli({ className = "" }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    const strokes = Array.from(node.querySelectorAll<SVGGeometryElement>("[data-stroke]"));
    const dots = Array.from(node.querySelectorAll<SVGCircleElement>("[data-dot]"));
    if (!strokes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([...strokes, ...dots], { opacity: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      strokes.forEach((stroke) => {
        const length = stroke.getTotalLength();
        gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: node,
            start: "top 88%",
            // This rangoli is the last thing on Our Story, so the designed
            // end sat past the bottom of the document and the drawing froze
            // at 85%. See `lib/draw-on-scroll.ts`.
            end: () =>
              drawEnd({
                ...measure(node, ScrollTrigger.maxScroll(window)),
                startRatio: 0.88,
                endRatio: 0.45,
              }),
            scrub: 0.9,
            // Recomputed on resize and refresh, so the clamp follows the page
            // rather than being measured once at mount.
            invalidateOnRefresh: true,
          },
        })
        .to(strokes, { strokeDashoffset: 0, ease: "none", stagger: 0.035 }, 0)
        .to(dots, { opacity: 1, ease: "none", stagger: 0.012 }, 0.4);
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      viewBox="0 0 400 400"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="var(--gold)"
    >
      <g strokeWidth="1" opacity="0.5">
        <circle data-stroke cx={CENTER} cy={CENTER} r="26" opacity="0" />
        {Array.from({ length: FOLDS }, (_, i) => (
          <path data-stroke key={`i${i}`} d={innerPath(i)} opacity="0" />
        ))}
        <circle data-stroke cx={CENTER} cy={CENTER} r="68" opacity="0" />
        {Array.from({ length: FOLDS }, (_, i) => (
          <path data-stroke key={`p${i}`} d={petalPath(i)} opacity="0" />
        ))}
        <circle data-stroke cx={CENTER} cy={CENTER} r="172" opacity="0" />
        <circle data-stroke cx={CENTER} cy={CENTER} r="184" opacity="0" />
        {Array.from({ length: FOLDS * 2 }, (_, i) => {
          const [x, y] = point(178, (360 / (FOLDS * 2)) * i);
          return (
            <circle
              data-dot
              key={`d${i}`}
              cx={x.toFixed(1)}
              cy={y.toFixed(1)}
              r="1.8"
              fill="var(--gold)"
              stroke="none"
              opacity="0"
            />
          );
        })}
      </g>
    </svg>
  );
}
