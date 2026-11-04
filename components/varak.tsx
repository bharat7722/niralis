"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * A sheet of gold leaf catching the light as a heading scrolls into view.
 *
 * The sweep runs *inside* the letterforms via background-clip, not as an
 * overlay, which is what separates it from a shine sitting on top of the
 * text. Headings opt in with `data-varak`; the transparent-text class is
 * added here rather than authored, so a heading is never invisible when
 * the script does not run.
 */
export default function Varak() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // background-clip: text has to actually work before we hide the colour.
    if (!CSS.supports("-webkit-background-clip", "text") && !CSS.supports("background-clip", "text")) {
      return;
    }

    const headings = Array.from(document.querySelectorAll<HTMLElement>("[data-varak]"));
    if (!headings.length) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      headings.forEach((heading) => {
        heading.classList.add("varak-on");
        gsap.to(heading, {
          backgroundPosition: "0% 0",
          duration: 1.5,
          ease: "power2.inOut",
          scrollTrigger: { trigger: heading, start: "top 85%", once: true },
        });
      });
    });

    return () => {
      ctx.revert();
      headings.forEach((heading) => heading.classList.remove("varak-on"));
    };
  }, [pathname]);

  return null;
}
