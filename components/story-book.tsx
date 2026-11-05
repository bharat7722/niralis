"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Ornament from "@/components/ornament";

type Chapter = {
  kicker: string;
  title: string;
  body: string;
  image: string;
  focus: string;
};

/** How far a leaf lies open once it has been turned. */
const OPEN = -178;
/** Fraction of the book's width a drag must cover to complete a turn. */
const THRESHOLD = 0.3;

/** One printed side of a leaf. */
function Plate({ chapter, index, total }: { chapter: Chapter; index: number; total: number }) {
  return (
    <>
      <div className="leaf-grain absolute inset-0" />

      <figure className="relative h-[52%] w-full overflow-hidden border-b border-gold/20">
        <Image
          src={chapter.image}
          alt={chapter.title}
          fill
          // Without this the browser starts its own image-drag on pointerdown
          // and takes the pointer with it, so a swipe begun over the
          // photograph never reached the page-turn handler.
          draggable={false}
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
 * Our Story as a bound book, turned by hand.
 *
 * The leaf follows the finger: drag left and the page lifts off the spine by
 * however far you have moved, let go past a third of the width and it falls
 * open, let go short of that and it drops back. That is what separates this
 * from a slideshow — the turn is reversible mid-gesture, the way paper is.
 *
 * Both sides of a leaf carry the same chapter, so a turned leaf lies on the
 * left still showing what you just read while the next faces you on the
 * right. The leaf itself must not clip its overflow: that would force
 * `transform-style: flat` and collapse the two faces onto one plane.
 */
export default function StoryBook({ chapters }: { chapters: Chapter[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const turning = useRef<{ leaf: HTMLElement; index: number; back: boolean } | null>(null);
  const startX = useRef(0);
  const busy = useRef(false);

  const leafAt = useCallback((index: number) => {
    return root.current?.querySelector<HTMLElement>(`[data-leaf="${index}"]`) ?? null;
  }, []);

  /** Turned leaves stack on the left, most recent on top; the rest keep the
   *  authored order so leaf one faces you on the right. */
  const restack = useCallback(
    (turned: number) => {
      chapters.forEach((_, index) => {
        const leaf = leafAt(index);
        if (leaf) leaf.style.zIndex = String(index < turned ? 100 + index : chapters.length - index);
      });
    },
    [chapters, leafAt],
  );

  useEffect(() => restack(page), [page, restack]);

  const settle = useCallback(
    (leaf: HTMLElement, index: number, open: boolean) => {
      busy.current = true;
      gsap.to(leaf, {
        rotateY: open ? OPEN : 0,
        duration: 0.55,
        ease: "power2.out",
        force3D: true,
        onComplete: () => {
          busy.current = false;
          setPage(open ? index + 1 : index);
        },
      });
      gsap.to(leaf.querySelector("[data-leaf-shade]"), {
        opacity: open ? 0.25 : 0,
        duration: 0.55,
      });
    },
    [],
  );

  const step = useCallback(
    (delta: number) => {
      if (busy.current) return;
      const next = page + delta;
      if (next < 0 || next > chapters.length - 1) return;
      const index = delta > 0 ? page : page - 1;
      const leaf = leafAt(index);
      if (leaf) settle(leaf, index, delta > 0);
    },
    [page, chapters.length, leafAt, settle],
  );

  /* ------------------------------------------------------------ dragging */

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (busy.current) return;
    startX.current = event.clientX;
    turning.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (busy.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const width = event.currentTarget.clientWidth || 1;
    const delta = event.clientX - startX.current;

    // The direction is only known once the finger has actually moved.
    if (!turning.current) {
      if (Math.abs(delta) < 6) return;
      const back = delta > 0;
      const index = back ? page - 1 : page;
      if (index < 0 || index > chapters.length - 2) return;
      const leaf = leafAt(index);
      if (!leaf) return;
      // A leaf coming back must sit above the pile it is rejoining.
      if (back) leaf.style.zIndex = String(100 + index);
      turning.current = { leaf, index, back };
    }

    const { leaf, back } = turning.current;
    const progress = gsap.utils.clamp(0, 1, Math.abs(delta) / width);
    gsap.set(leaf, { rotateY: back ? OPEN * (1 - progress) : OPEN * progress });
    gsap.set(leaf.querySelector("[data-leaf-shade]"), {
      // Darkest edge-on, which is halfway through the turn.
      opacity: 0.85 * Math.sin(Math.PI * (back ? 1 - progress : progress)),
    });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const held = turning.current;
    turning.current = null;
    if (!held) return;

    const width = event.currentTarget.clientWidth || 1;
    const progress = Math.abs(event.clientX - startX.current) / width;
    const committed = progress > THRESHOLD;
    settle(held.leaf, held.index, held.back ? !committed : committed);
  };

  return (
    <div ref={root} className="mt-16 flex flex-col items-center pb-10">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          else if (event.key === "ArrowLeft") step(-1);
          else return;
          event.preventDefault();
        }}
        tabIndex={0}
        role="group"
        aria-label="Our story, page by page. Use the arrow keys to turn."
        className="relative aspect-[3/4] w-full max-w-sm touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        style={{ perspective: 1800 }}
      >
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
            data-leaf={index}
            className="leaf absolute inset-0"
            style={{ zIndex: chapters.length - index }}
          >
            <div className="leaf-face border border-gold/30 bg-card">
              <Plate chapter={chapter} index={index} total={chapters.length} />
              <span aria-hidden="true" className="leaf-gutter pointer-events-none absolute inset-0" />
              <span
                data-leaf-shade
                aria-hidden="true"
                className="leaf-sheen pointer-events-none absolute inset-0 opacity-0"
              />
            </div>

            {/* The same chapter on the reverse, so it stays on the left-hand
                page once the leaf has been turned. */}
            <div className="leaf-face leaf-back border border-gold/30 bg-card">
              <Plate chapter={chapter} index={index} total={chapters.length} />
              <span aria-hidden="true" className="leaf-gutter-back pointer-events-none absolute inset-0" />
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
