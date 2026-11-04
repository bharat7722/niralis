"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestbookEntry } from "@/lib/store";
import { site } from "@/lib/site";
import Ornament from "@/components/ornament";

const FIELD =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold/40";
const LABEL = "mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted-foreground";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[] | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/guestbook", { cache: "no-store" });
      const data = (await response.json()) as { entries?: GuestbookEntry[] };
      setEntries(data.entries ?? []);
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !message.trim()) {
      setError("Please add both your name and a message.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setName("");
      setMessage("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Wishes &amp; blessings</p>
          <h1 data-varak className="mt-3 font-display text-5xl text-primary">Leave a Wish</h1>
          <Ornament className="mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Write a wish, a blessing, or a bit of advice for {site.groom} &amp; {site.bride}.
            Everything you leave here appears below, for them to read and keep.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-3xl border border-gold/30 bg-card p-6 sm:p-8"
        >
          <label className="block">
            <span className={LABEL}>Your name</span>
            <input
              maxLength={100}
              className={FIELD}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className={LABEL}>Your wish or blessing</span>
            <textarea
              maxLength={1000}
              rows={3}
              className={FIELD}
              placeholder="Share a wish, a memory, or a blessing…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={sending}
            className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send Your Wish"}
          </button>
        </form>

        <div className="mt-12 space-y-5">
          {entries === null && (
            <>
              <p className="sr-only" aria-live="polite">
                Loading wishes
              </p>
              {/* Placeholders rather than a spinner, so the list does not
                  jump once the real wishes land. */}
              <div aria-hidden="true" className="space-y-5">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="rounded-2xl border border-gold/20 bg-card px-5 py-5"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="skeleton block h-4 w-28" />
                      <span className="skeleton block h-3 w-20" />
                    </div>
                    <span className="skeleton mt-4 block h-3 w-full" />
                    <span className="skeleton mt-2 block h-3 w-4/5" />
                  </div>
                ))}
              </div>
            </>
          )}

          {entries?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No wishes yet — be the first to leave one.
            </p>
          )}

          {entries?.map((entry, index) => (
            <article
              key={entry.id}
              className="wish-in relative overflow-hidden rounded-2xl border border-gold/25 bg-card px-5 py-5"
              /* Capped, so wish fifty does not wait three seconds. */
              style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-4 right-4 select-none font-display text-7xl leading-none text-gold/15"
              >
                &rdquo;
              </span>
              <div className="relative flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl text-primary">{entry.name}</h2>
                <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
              <p className="relative mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {entry.message}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
