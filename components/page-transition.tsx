"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Module scope, so it survives the remount app/template.tsx performs on every
 * navigation: the first paint belongs to the hero overture.
 */
let firstLoad = true;

/**
 * Nothing covers the page. The arriving content lifts into place and its
 * heading resolves out of a soft blur — the restraint is the point, a panel
 * sliding over the screen reads as a loading state, not as craft.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (firstLoad) {
      firstLoad = false;
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Runs before paint, so the page is never seen in its pre-animation state.
      //
      // clearProps matters more than it looks: GSAP leaves `translate(0px,
      // 0px)` behind, and *any* transform makes this div the containing block
      // for fixed-position descendants — which breaks ScrollTrigger's pinning
      // and the gallery lightbox's full-screen overlay.
      timeline.from(node, {
        autoAlpha: 0,
        y: 16,
        duration: 0.5,
        clearProps: "transform,visibility,opacity",
      }, 0);

      const heading = node.querySelector("h1");
      // The hero choreographs its own entrance. Reaching into it from here
      // picked up the <h1> holding the groom's name and nothing else — the
      // bride's line is a <p> — so the pair came apart on every return to
      // the home page.
      if (heading && !heading.closest("[data-hero='content']")) {
        // The kicker above the title comes with it, so the pair reads as one unit.
        const cluster = [heading.previousElementSibling, heading].filter(
          (element): element is Element => element instanceof Element,
        );
        timeline.fromTo(
          cluster,
          { y: 20, filter: "blur(7px)" },
          {
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.1,
            // A lingering filter is a containing block too, and it would
            // also override the gold-leaf heading sweep.
            clearProps: "transform,filter",
          },
          0.08,
        );
      }
    }, node);

    return () => ctx.revert();
  }, [pathname]);

  return <div ref={root}>{children}</div>;
}
