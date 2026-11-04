"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export default function ShareInvite() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.origin;
    const payload = {
      title: `${site.groom} & ${site.bride}`,
      text: `${site.tagline} — ${site.dateAndPlace}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (cause) {
        // Dismissing the share sheet is not a failure worth reacting to.
        if (cause instanceof DOMException && cause.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure origin, denied permission) — stay quiet
      // rather than show an error the guest can do nothing about.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-gold/70 hover:text-primary active:scale-[0.98]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 10.5V2m0 0L5 5m3-3 3 3" />
        <path d="M3 9.5v3a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-3" />
      </svg>
      {copied ? "Link copied" : "Share this invite"}
    </button>
  );
}
