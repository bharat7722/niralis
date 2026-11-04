"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/reveal";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Photo = { src: string; alt: string; caption: string };

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const open = index !== null;
  const photo = index === null ? null : photos[index];

  /** Record where the photo is now, so Flip can morph it to where it lands. */
  const capture = useCallback((at: number | null) => {
    if (at === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flipState.current = Flip.getState(`[data-flip-id="photo-${at}"]`);
  }, []);

  const openAt = useCallback(
    (at: number) => {
      capture(at);
      setIndex(at);
    },
    [capture],
  );

  const close = useCallback(() => {
    capture(index);
    setIndex(null);
  }, [capture, index]);

  // Both directions land here: the thumbnail grows into the overlay, and on
  // close the overlay shrinks back into its tile.
  useIsoLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.55,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
    });
  }, [index]);
  const step = useCallback(
    (by: number) => setIndex((i) => (i === null ? i : (i + by + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    gsap.registerPlugin(Flip, ScrollTrigger);
  }, []);

  // Each photograph drifts a little slower than its frame, so the grid gains
  // depth. The overscale is what keeps the shift from exposing an edge.
  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((image) => {
        gsap.set(image, { scale: 1.14 });
        gsap.fromTo(
          image,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: image.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, node);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    // The page behind must not scroll under the overlay.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      restoreFocus.current?.focus();
    };
  }, [open, close, step]);

  return (
    <>
      <div ref={gridRef} className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((item, i) => (
          <Reveal
            key={item.caption}
            variant="scale"
            delay={(i % 3) * 70}
            className="mb-4 break-inside-avoid"
          >
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-label={`Open ${item.caption}`}
              className="group block w-full overflow-hidden rounded-2xl border border-gold/25 bg-card text-left transition-colors hover:border-gold/60 active:scale-[0.99]"
            >
              <Image
                data-parallax
                data-flip-id={index === i ? undefined : `photo-${i}`}
                src={item.src}
                alt={item.alt}
                width={800}
                height={1000}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="w-full object-cover"
              />
              <span className="block px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {item.caption}
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {open && photo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption}
          className="lightbox fixed inset-0 z-[60] flex flex-col items-center justify-center px-4 py-16"
          onClick={close}
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const dx = event.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <p className="absolute left-5 top-5 text-[11px] uppercase tracking-[0.25em] text-white/55">
            {(index ?? 0) + 1} / {photos.length}
          </p>

          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
          >
            <span aria-hidden="true" className="relative block h-4 w-4">
              <span className="absolute left-0 top-2 h-px w-4 rotate-45 bg-current" />
              <span className="absolute left-0 top-2 h-px w-4 -rotate-45 bg-current" />
            </span>
          </button>

          {/* Stop clicks on the picture itself from dismissing the overlay. */}
          <figure
            className="flex max-h-full flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              key={photo.src}
              data-flip-id={`photo-${index}`}
              src={photo.src}
              alt={photo.alt}
              width={1400}
              height={1750}
              sizes="92vw"
              className="max-h-[74vh] w-auto rounded-2xl border border-gold/25 object-contain"
            />
            <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-gold">
              {photo.caption}
            </figcaption>
          </figure>

          <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-10">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              className="flex h-11 w-11 items-center justify-center text-xl text-white/60 transition-colors hover:text-white"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              className="flex h-11 w-11 items-center justify-center text-xl text-white/60 transition-colors hover:text-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
