"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Evenly spaced cusps down a door, echoing the diamond in the ornament. */
const CUSPS = [14, 27, 40, 53, 66, 79, 92];

/**
 * A palace window whose carved doors the guest swings open by scrolling.
 *
 * Perspective is applied per door via GSAP rather than to the frame: the
 * frame is clipped to the arch, and a clip-path on the same element that
 * establishes the 3D context flattens the rotation into a sliding rectangle.
 * Each door also darkens as it turns away, which is what reads as depth.
 */
export default function Jharokha() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-jh='left'], [data-jh='right']", {
        opacity: 1,
        rotateY: 0,
        transformPerspective: 1100,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: node,
            // A long, slow range — the swing should feel weighted, not flicked.
            start: "top 92%",
            end: "top 12%",
            scrub: 1.1,
          },
        })
        .to("[data-jh='left']", { rotateY: -104, z: 44, ease: "none" }, 0)
        .to("[data-jh='right']", { rotateY: 104, z: 44, ease: "none" }, 0)
        .fromTo("[data-jh='shade']", { opacity: 0 }, { opacity: 0.72, ease: "none" }, 0)
        .fromTo("[data-jh='photo']", { scale: 1.16 }, { scale: 1, ease: "none" }, 0)
        .fromTo("[data-jh='glow']", { opacity: 0.85 }, { opacity: 0, ease: "none" }, 0);
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-paper py-20">
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <clipPath id="jharokha-arch" clipPathUnits="objectBoundingBox">
            <path d="M0 1 L0 0.46 C0 0.21 0.21 0.02 0.5 0 C0.79 0.02 1 0.21 1 0.46 L1 1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto max-w-sm px-6">
        <p className="text-center text-[14px] font-semibold uppercase tracking-[0.3em] text-gold">
          A glimpse
        </p>

        <div className="arch-clip mt-8 bg-gold p-[3px]">
          <div className="arch-clip relative aspect-[3/4] w-full overflow-hidden bg-[#2a1a12]">
            <Image
              data-jh="photo"
              src="/images/courtyard-portrait.jpg"
              alt="Harsh and Nirali framed by a carved arch"
              fill
              sizes="(min-width: 640px) 320px, 90vw"
              className="object-cover"
            />
            {/* The room beyond is dim until the doors let light in. */}
            <span
              data-jh="glow"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[#2a1a12]"
            />

            {(["left", "right"] as const).map((side) => (
              <div
                key={side}
                data-jh={side}
                aria-hidden="true"
                className={`jharokha-door absolute inset-y-0 w-1/2 opacity-0 ${
                  side === "left" ? "left-0 origin-left" : "right-0 origin-right"
                }`}
              >
                <span className="absolute inset-[6px] border border-[#8a5f14]/40" />
                <span className="absolute inset-[10px] border border-[#fff3d6]/25" />
                {CUSPS.map((top) => (
                  <span
                    key={top}
                    style={{ top: `${top}%` }}
                    className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-[#8a5f14]/45"
                  />
                ))}
                <span
                  data-jh="shade"
                  className={`pointer-events-none absolute inset-0 opacity-0 ${
                    side === "left" ? "jharokha-shade" : "jharokha-shade-right"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
