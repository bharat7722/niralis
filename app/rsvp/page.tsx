"use client";

import { useState } from "react";
import Celebration from "@/components/celebration";
import { site } from "@/lib/site";
import Ornament from "@/components/ornament";

const FIELD =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40";
const LABEL = "mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted-foreground";
const HELP = "mt-1.5 block text-[11px] leading-relaxed text-muted-foreground/80";

export default function RsvpPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    attending: "",
    guests: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const coming = form.attending === "yes";
  const declined = form.attending === "no";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!form.attending) {
      setError("Please choose whether you can join us.");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("sent");
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    }
  }

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Kindly reply</p>
          <h1 data-varak className="mt-3 font-display text-5xl text-primary">Aagman Confirmation</h1>
          <Ornament className="mx-auto mt-6" />
        </div>

        {status === "sent" ? (
          <div className="mt-12 rounded-3xl border border-gold/30 bg-card p-10 text-center">
            <Celebration />
            <h2 className="font-display text-3xl text-primary">Thank you</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {coming
                ? `Your reply is saved — we can’t wait to celebrate with you on ${site.dateLabel}.`
                : "Thank you for letting us know. You will be missed."}
            </p>
            <Ornament className="mx-auto mt-6" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-12 space-y-6 rounded-3xl border border-gold/30 bg-card p-6 sm:p-10"
          >
            <fieldset className="block">
              <legend className={LABEL}>Attendance</legend>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer rounded-lg border border-input px-4 py-3 text-center text-sm uppercase tracking-wide has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-primary">
                  <input
                    type="radio"
                    className="sr-only"
                    name="attending"
                    value="yes"
                    checked={coming}
                    onChange={() => set("attending")("yes")}
                  />
                  Joyfully accept
                </label>
                <label className="flex-1 cursor-pointer rounded-lg border border-input px-4 py-3 text-center text-sm uppercase tracking-wide has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-primary">
                  <input
                    type="radio"
                    className="sr-only"
                    name="attending"
                    value="no"
                    checked={declined}
                    onChange={() => set("attending")("no")}
                  />
                  Regretfully decline
                </label>
              </div>
            </fieldset>

            <label className="block">
              <span className={LABEL}>Your name</span>
              <input
                className={FIELD}
                placeholder="Your name"
                name="name"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
              />
            </label>

            <label className="block">
              <span className={LABEL}>Phone number</span>
              <input
                type="tel"
                className={FIELD}
                placeholder="+91 98765 43210"
                name="phone"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
              />
              <span className={HELP}>So we can reach you if we need to.</span>
            </label>

            <label className="block">
              <span className={LABEL}>Email (optional)</span>
              <input
                type="email"
                className={FIELD}
                placeholder="you@example.com"
                name="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
              />
            </label>

            {!declined && (
              <>
                <label className="block">
                  <span className={LABEL}>How many people are coming?</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    className="w-24 rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
                    name="guests"
                    placeholder="1"
                    value={form.guests}
                    onChange={(e) => set("guests")(e.target.value)}
                  />
                  <span className={HELP}>Including yourself.</span>
                </label>
              </>
            )}

            <label className="block">
              <span className={LABEL}>
                A note for {site.groom} &amp; {site.bride} (optional)
              </span>
              <textarea
                name="message"
                rows={3}
                className={FIELD}
                placeholder="Anything you’d like to say"
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
              />
            </label>

            {error && <p className="text-center text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send Reply"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
