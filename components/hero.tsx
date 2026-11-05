"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Petals from "@/components/petals";
import { site } from "@/lib/site";

/** Layout effect on the client, plain effect during SSR, to avoid the warning. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const OVERTURE_KEY = "hn-overture";

/**
 * Splits a word so each letter can be timed on its own. The whole word keeps
 * one accessible name and the letters are hidden from assistive tech, so a
 * screen reader reads "Harsh", never "H, a, r, s, h".
 */
function Word({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span aria-label={text} className={className}>
      {Array.from(text).map((character, index) => (
        <span key={index} aria-hidden="true" data-char className="inline-block">
          {character === " " ? " " : character}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const node = root.current;
    if (!node) return;

    gsap.registerPlugin(ScrollTrigger);

    // Everything is authored visible, so a failed script leaves a readable
    // hero rather than a blank one. GSAP only ever animates *from* a state.
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!reduced) {
        // The hero recedes as the page moves on, rather than scrolling flat.
        gsap.to("[data-hero='content']", {
          y: -70,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      let alreadySeen = false;
      try {
        alreadySeen = sessionStorage.getItem(OVERTURE_KEY) === "1";
      } catch {
        alreadySeen = false;
      }

      if (reduced) return;

      // The full overture is a first impression, not something to sit through
      // on every return to the home page — but arriving to a dead hero is
      // worse. Coming back plays a short reprise instead, and crucially it
      // carries both names: the page-level transition can only reach the
      // <h1>, which would animate the groom's line alone.
      if (alreadySeen) {
        gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.7 } })
          .from("[data-hero='kicker'] [data-char]", { y: 12, opacity: 0, stagger: 0.015 }, 0)
          .from("[data-hero='groom'] [data-char]", { y: 26, opacity: 0, stagger: 0.028 }, 0.08)
          .from("[data-hero='amp']", { scale: 0.6, opacity: 0, duration: 0.55 }, 0.2)
          .from("[data-hero='bride'] [data-char]", { y: 26, opacity: 0, stagger: 0.028 }, 0.26)
          .fromTo("[data-hero='rule']", { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, 0.42)
          .from("[data-hero='meta']", { y: 10, opacity: 0, duration: 0.6 }, 0.5)
          .from("[data-hero='tag']", { y: 10, opacity: 0, duration: 0.6 }, 0.58);
        return;
      }

      try {
        sessionStorage.setItem(OVERTURE_KEY, "1");
      } catch {
        // Private browsing — it simply plays again next time.
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero='image']", { scale: 1.18, duration: 3.1, ease: "power2.out" }, 0)
        .fromTo("[data-hero='veil']", { opacity: 1 }, { opacity: 0, duration: 2.1, ease: "power2.inOut" }, 0)
        .from("[data-hero='kicker'] [data-char]", { y: 16, opacity: 0, duration: 0.7, stagger: 0.022 }, 0.4)
        .from(
          "[data-hero='groom'] [data-char]",
          { y: 64, opacity: 0, rotateX: -42, duration: 1.05, stagger: 0.052 },
          0.8,
        )
        .from(
          "[data-hero='amp']",
          { scale: 0.35, opacity: 0, rotate: -22, duration: 0.85, ease: "back.out(1.9)" },
          1.3,
        )
        .to(
          "[data-hero='amp']",
          { textShadow: "0 0 26px rgba(213,161,60,0.85)", duration: 0.45, yoyo: true, repeat: 1 },
          1.95,
        )
        .from(
          "[data-hero='bride'] [data-char]",
          { y: 64, opacity: 0, rotateX: -42, duration: 1.05, stagger: 0.052 },
          1.5,
        )
        .fromTo("[data-hero='rule']", { scaleX: 0 }, { scaleX: 1, duration: 1.1 }, 2.15)
        .from("[data-hero='meta']", { y: 16, opacity: 0, duration: 0.85 }, 2.35)
        .from("[data-hero='tag']", { y: 14, opacity: 0, duration: 0.85 }, 2.55);
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[88vh] items-center justify-center overflow-hidden"
    >
      {/* The wrapper is what GSAP scales, and it sits slightly outside the
          section on every side. A blur samples beyond the element it is
          applied to, so a blurred image pinned to inset-0 fades out along its
          own edges; overflowing the section and letting it clip avoids that
          without touching the ken-burns transform. */}
      <div data-hero="image" className="absolute -inset-[2.5%]">
        <Image
          src="/images/hero-mandap.jpg"
          alt="Harsh and Nirali under a floral archway at sunset"
          fill
          priority
          sizes="110vw"
          className="object-cover blur-[1.5px]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/35 via-primary/25 to-primary/60" />
      {/* Opaque only while the overture runs; invisible otherwise. */}
      <div data-hero="veil" aria-hidden="true" className="absolute inset-0 bg-primary opacity-0" />
      <Petals />

      <div
        data-hero="content"
        className="relative z-20 px-6 text-center text-primary-foreground"
        style={{ perspective: 900 }}
      >
        <p data-hero="kicker">
          <Word
            text={site.tagline}
            className="block text-xs font-semibold uppercase tracking-[0.4em] text-white/90 drop-shadow-sm"
          />
        </p>
        <h1 data-hero="groom" className="mt-5 font-display text-6xl leading-none drop-shadow-sm sm:text-8xl">
          <Word text={site.groom} />
        </h1>
        <p
          data-hero="amp"
          className="my-2 inline-block font-display text-3xl italic text-gold sm:text-4xl"
        >
          &amp;
        </p>
        <p data-hero="bride" className="font-display text-6xl leading-none drop-shadow-sm sm:text-8xl">
          <Word text={site.bride} />
        </p>
        <div data-hero="rule" className="mx-auto my-7 h-px w-40 bg-white/40" />
        <p
          data-hero="meta"
          className="text-[14px] font-semibold uppercase tracking-[0.28em] text-white drop-shadow-sm"
        >
          {site.dateLabel}
          {/* Held at the smaller size while the date steps up, so the date
              leads and the place sits under it. */}
          <span className="mt-1.5 block text-xs">{site.placeLabel}</span>
        </p>
        <p data-hero="tag" className="mt-3 text-xs uppercase tracking-[0.3em] text-gold">
          {site.hashtag}
        </p>
      </div>

    </section>
  );
}
