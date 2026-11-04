"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Marigold petals drifting over the hero.
 *
 * Every petal is two nested spans, one falling and one swaying, both animated
 * in CSS so the browser composites them on the GPU. The values below are
 * fixed rather than random, so the server and client render the same thing.
 *
 * Scroll speed then leans on those same CSS animations through their
 * playbackRate — a gust while the guest is moving, easing back to rest when
 * they stop. Changing the rate costs nothing; re-authoring the animation
 * every frame would cost plenty.
 */

type Petal = {
  left: string;
  size: number;
  fall: number;
  sway: number;
  delay: number;
  /** Petals past this index only appear once there is room for them. */
  wide?: boolean;
};

const PETALS: Petal[] = [
  { left: "6%", size: 13, fall: 15, sway: 3.4, delay: 0 },
  { left: "19%", size: 9, fall: 19, sway: 4.6, delay: -6 },
  { left: "31%", size: 15, fall: 13, sway: 3.9, delay: -11 },
  { left: "44%", size: 10, fall: 21, sway: 5.2, delay: -3 },
  { left: "58%", size: 14, fall: 16, sway: 4.1, delay: -14 },
  { left: "71%", size: 11, fall: 18, sway: 3.6, delay: -8 },
  { left: "84%", size: 13, fall: 14, sway: 4.8, delay: -17 },
  { left: "93%", size: 9, fall: 20, sway: 4.3, delay: -2 },
  { left: "12%", size: 11, fall: 17, sway: 5.0, delay: -9, wide: true },
  { left: "26%", size: 8, fall: 22, sway: 3.8, delay: -15, wide: true },
  { left: "38%", size: 13, fall: 15, sway: 4.4, delay: -19, wide: true },
  { left: "52%", size: 10, fall: 20, sway: 3.5, delay: -5, wide: true },
  { left: "65%", size: 12, fall: 17, sway: 4.9, delay: -12, wide: true },
  { left: "78%", size: 9, fall: 23, sway: 4.0, delay: -21, wide: true },
];

export default function Petals() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const tracks = Array.from(node.querySelectorAll<HTMLElement>(".petal-track"));
    if (!tracks.length) return;

    let target = 1;
    let rate = 1;

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        target = gsap.utils.clamp(1, 3.6, 1 + Math.abs(self.getVelocity()) / 850);
      },
    });

    const tick = () => {
      target += (1 - target) * 0.04; // the gust always dies down
      rate += (target - rate) * 0.09; // and the petals chase it smoothly
      if (Math.abs(rate - 1) < 0.004) return;
      for (const track of tracks) {
        for (const animation of track.getAnimations({ subtree: true })) {
          animation.playbackRate = rate;
        }
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="petals pointer-events-none absolute inset-0 z-10">
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className={`petal-track ${petal.wide ? "hidden sm:block" : ""}`}
          style={{
            left: petal.left,
            animationDuration: `${petal.fall}s`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          <span
            className="petal"
            style={{
              width: `${petal.size}px`,
              height: `${Math.round(petal.size * 1.35)}px`,
              animationDuration: `${petal.sway}s`,
              animationDelay: `${petal.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
