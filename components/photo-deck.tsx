"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Photo = { src: string; alt: string };

/**
 * A stack of photographs the guest fans open by scrolling, and closes again
 * by scrolling back. Each card is a single rotate + translate, so the whole
 * deck costs a handful of composited transforms.
 *
 * Without JavaScript it stays a tidy stack — no content is lost, because the
 * full gallery sits directly below it.
 */
export default function PhotoDeck({ photos }: { photos: Photo[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      if (!cards.length) return;

      const middle = (cards.length - 1) / 2;

      // matchMedia gives each breakpoint its own spread, and reverts the
      // other one's tweens when the viewport crosses over.
      const mm = gsap.matchMedia();

      const fan = (spacing: number, tilt: number, lift: number) => () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: node, start: "top 88%", end: "top 30%", scrub: 0.8 },
        });
        cards.forEach((card, index) => {
          const offset = index - middle;
          tl.to(
            card,
            {
              x: offset * spacing,
              y: Math.abs(offset) * lift,
              rotate: offset * tilt,
              ease: "none",
            },
            0,
          );
        });
      };

      mm.add("(min-width: 640px)", fan(74, 8.5, 13));
      mm.add("(max-width: 639.98px)", fan(38, 7, 9));
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="relative mt-12 flex h-[16rem] items-center justify-center sm:h-[22rem]"
    >
      {photos.map((photo, index) => (
        <div
          key={photo.src}
          data-card
          className="absolute h-[11rem] w-[8.25rem] overflow-hidden rounded-xl border border-gold/40 bg-card shadow-[0_18px_40px_-26px_oklch(38%_0.1_12)] sm:h-[15rem] sm:w-[11.25rem]"
          style={{ zIndex: index }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 640px) 180px, 132px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
