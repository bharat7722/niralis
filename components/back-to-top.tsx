"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Appears once the guest is well down a page. Like the header's progress
 * hairline, the scroll handler is passive and rAF-throttled, and it only
 * touches React state on the rare frame where the button crosses its
 * threshold — never once per scroll frame.
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;
    let was = false;

    const update = () => {
      ticking = false;
      const next = window.scrollY > window.innerHeight * 1.2;
      if (next !== was) {
        was = next;
        setShown(next);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reduced.current ? "auto" : "smooth" })
      }
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      className={`to-top ${
        shown ? "is-shown" : ""
      } fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-background/90 text-primary shadow-[0_8px_24px_-16px_oklch(38%_0.1_12)] backdrop-blur-md transition-colors hover:border-gold active:scale-95`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 13V3.5M3.5 8 8 3.5 12.5 8" />
      </svg>
    </button>
  );
}
