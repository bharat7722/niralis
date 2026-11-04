"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/lib/site";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);

  // Navigating away should never leave the panel hanging open behind the page.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const bar = progressRef.current;
    let ticking = false;
    let was = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      const next = y > 12;
      if (next !== was) {
        was = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (href: string) =>
    pathname === href ? "text-primary" : "text-muted-foreground";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gold/20 backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "bg-background/95 shadow-[0_6px_24px_-20px_oklch(38%_0.1_12)]" : "bg-background/85"
      }`}
    >
      <div
        className={`relative z-50 mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 transition-[padding] duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Link href="/" className="flex items-center" aria-label="Harsh & Nirali — home">
          <Image
            src="/images/monogram.png"
            alt="Harsh &amp; Nirali"
            width={521}
            height={464}
            priority
            className={`w-auto transition-all duration-300 ${scrolled ? "h-8" : "h-10"}`}
          />
        </Link>

        {/* The full row only fits once there is room for every label — below
            that it becomes a panel rather than a strip you have to drag. */}
        <nav className="hidden justify-end gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`whitespace-nowrap px-3 py-1 text-xs uppercase tracking-[0.2em] transition-colors hover:text-primary ${linkClass(
                link.href,
              )}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-primary lg:hidden"
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span
              className={`absolute left-0 h-px w-5 bg-current transition-all duration-200 ${
                open ? "top-2 rotate-45" : "top-0.5"
              }`}
            />
            <span
              className={`absolute left-0 top-2 h-px w-5 bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-px w-5 bg-current transition-all duration-200 ${
                open ? "top-2 -rotate-45" : "top-[15px]"
              }`}
            />
          </span>
        </button>
      </div>

      <span
        ref={progressRef}
        aria-hidden="true"
        className="progress-line absolute inset-x-0 bottom-0 h-[2px]"
      />

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-primary/10 lg:hidden"
          />
          <nav
            id="mobile-nav"
            className="nav-drop relative z-50 border-t border-gold/20 bg-background/95 backdrop-blur-md lg:hidden"
          >
            <div className="mx-auto flex max-w-5xl flex-col px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`rounded-lg px-3 py-3.5 text-xs uppercase tracking-[0.2em] transition-colors active:bg-gold/10 ${linkClass(
                    link.href,
                  )}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
