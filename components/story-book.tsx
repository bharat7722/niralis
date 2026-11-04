"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Ornament from "@/components/ornament";
import { site } from "@/lib/site";

type Chapter = {
  kicker: string;
  title: string;
  body: string;
  image: string;
  focus: string;
};

/** One printed side of a leaf. */
function Plate({
  chapter,
  index,
  total,
}: {
  chapter: Chapter;
  index: number;
  total: number;
}) {
  return (
    <>
      <div className="leaf-grain absolute inset-0" />

      <figure className="relative h-[52%] w-full overflow-hidden border-b border-gold/20">
        <Image
          src={chapter.image}
          alt={chapter.title}
          fill
          sizes="(min-width: 640px) 384px, 92vw"
          className="object-cover"
          style={{ objectPosition: chapter.focus }}
        />
      </figure>

      <div className="relative px-6 pt-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{chapter.kicker}</p>
        <h3 className="mt-2 font-display text-2xl text-primary">{chapter.title}</h3>
        <Ornament className="mx-auto mt-3" />
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{chapter.body}</p>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
        {index + 1} / {total}
      </p>
    </>
  );
}

/**
 * Our Story as a bound book: the section holds still while the guest's scroll
 * turns the leaves.
 *
 * Both sides of a leaf carry the same chapter, which is what makes the thing
 * read as an open book: once a leaf has turned it lies on the left still
 * showing the chapter you just read, while the next one faces you on the
 * right. A blank verso would instead make each turn feel like the story had
 * been thrown away.
 *
 * The leaf itself must not clip its overflow — that forces
 * `transform-style: flat` and collapses both faces onto one plane. Each face
 * clips itself instead.
 *
 * Pinning is kept short and without `anticipatePin`: engaging a pin early
 * shifts the document height at the boundary, which oscillates and reads as
 * the whole page shaking.
 */
export default function StoryBook({ chapters }: { chapters: Chapter[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const leaves = gsap.utils.toArray<HTMLElement>("[data-leaf]");
      // The last page is the destination; it never turns.
      const turning = leaves.slice(0, -1);
      if (!turning.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: node,
          start: "center center",
          end: `+=${turning.length * 440}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      turning.forEach((leaf, index) => {
        const at = index;
        tl
          // Eased rather than linear: a real page gathers pace off the spine
          // and settles as it lands, even though scroll drives the timing.
          .to(leaf, { rotateY: -178, duration: 1, force3D: true, ease: "power1.inOut" }, at)
          // Restack as it passes edge-on. The authored order puts leaf one on
          // top, which is right for the unturned pile on the right but exactly
          // wrong once they land on the left — there the leaf turned most
          // recently belongs on top, or the left page is stuck showing
          // chapter one forever. Scrubbing back reverts this automatically.
          .set(leaf, { zIndex: 100 + index }, at + 0.5)
          // Darkest when the leaf is edge-on to the light, halfway through.
          .to(leaf.querySelector("[data-leaf-shade]"), { opacity: 0.85, duration: 0.5, ease: "none" }, at)
          .to(leaf.querySelector("[data-leaf-shade]"), { opacity: 0.25, duration: 0.5, ease: "none" }, at + 0.5)
          // The page underneath catches the lifting leaf's shadow.
          .fromTo(
            leaves[index + 1]?.querySelector("[data-leaf-cast]") ?? [],
            { opacity: 0.5 },
            { opacity: 0, duration: 1, ease: "none" },
            at,
          );
      });
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="mt-16 flex justify-center pb-16">
      <div className="relative aspect-[3/4] w-full max-w-sm" style={{ perspective: 1800 }}>
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1.5 w-3 rounded-l bg-gradient-to-r from-[#8a5f14] via-gold/70 to-gold/20"
        />
        {/* The edges of the leaves still to come, giving the book thickness. */}
        {[3, 6, 9].map((offset) => (
          <span
            key={offset}
            aria-hidden="true"
            style={{ right: -offset, top: offset / 2, bottom: offset / 2 }}
            className="absolute w-px rounded-r bg-gold/25"
          />
        ))}

        {chapters.map((chapter, index) => (
          <article
            key={chapter.title}
            data-leaf
            className="leaf absolute inset-0"
            style={{ zIndex: chapters.length - index }}
          >
            <div className="leaf-face border border-gold/30 bg-card">
              <Plate chapter={chapter} index={index} total={chapters.length} />
              <span data-leaf-cast aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#4a2114] opacity-0" />
              <span aria-hidden="true" className="leaf-gutter pointer-events-none absolute inset-0" />
              <span data-leaf-shade aria-hidden="true" className="leaf-sheen pointer-events-none absolute inset-0 opacity-0" />
            </div>

            {/* The same chapter on the reverse, so it stays on the left-hand
                page once the leaf has been turned. */}
            <div className="leaf-face leaf-back border border-gold/30 bg-card">
              <Plate chapter={chapter} index={index} total={chapters.length} />
              <span aria-hidden="true" className="leaf-gutter-back pointer-events-none absolute inset-0" />
            </div>
          </article>
        ))}

        <p className="absolute -bottom-9 left-0 right-0 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Scroll to turn the page · {site.hashtag}
        </p>
      </div>
    </div>
  );
}
