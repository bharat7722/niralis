"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const INTERACTIVE = "a, button, summary, input, select, textarea, [role='button']";

export default function PointerFlourish() {
  const ring = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // A mouse, a trackpad, a stylus — anything that reports a precise,
    // persistent position. Touch screens report "coarse" and get the bloom.
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (!finePointer) {
      const bloom = (event: PointerEvent) => {
        const node = document.createElement("span");
        node.className = "touch-ripple";
        node.style.left = `${event.clientX}px`;
        node.style.top = `${event.clientY}px`;
        document.body.appendChild(node);

        gsap.fromTo(
          node,
          { scale: 0.2, opacity: 0.6 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => node.remove(),
          },
        );
      };

      window.addEventListener("pointerdown", bloom, { passive: true });
      return () => {
        window.removeEventListener("pointerdown", bloom);
        document.querySelectorAll(".touch-ripple").forEach((node) => node.remove());
      };
    }

    const node = ring.current;
    if (!node) return;

    // quickTo keeps one tween alive and retargets it, instead of spawning a
    // tween per mousemove — this is what makes the trail smooth rather than
    // stuttery under a fast pointer.
    const moveX = gsap.quickTo(node, "x", { duration: 0.38, ease: "power3" });
    const moveY = gsap.quickTo(node, "y", { duration: 0.38, ease: "power3" });

    let shown = false;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.to(node, { opacity: 1, duration: 0.3 });
      }
      moveX(event.clientX);
      moveY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const near = target?.closest?.(INTERACTIVE);
      gsap.to(node, {
        scale: near ? 1.8 : 1,
        borderColor: near
          ? "color-mix(in oklab, var(--gold) 100%, transparent)"
          : "color-mix(in oklab, var(--gold) 75%, transparent)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      shown = false;
      gsap.to(node, { opacity: 0, duration: 0.25 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(node);
    };
  }, []);

  return <span ref={ring} aria-hidden="true" className="cursor-ring" />;
}
