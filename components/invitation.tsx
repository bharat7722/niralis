import Ornament from "@/components/ornament";
import Reveal from "@/components/reveal";
import InvitationFrame from "@/components/invitation-frame";
import { site } from "@/lib/site";

/**
 * The invitation itself, written inside a rangoli the guest draws by
 * scrolling.
 *
 * This used to be a folded card with two gold foil flaps that swung open on
 * scroll. The flaps were the loudest thing on the page and read as a cardboard
 * prop — and because each covered half the card until the guest had scrolled
 * far enough, the names were hidden behind them on arrival. A rangoli is what
 * is actually drawn on the floor outside the house on a wedding morning, it
 * never hides the words, and drawing it with a thumb is a better reason to
 * scroll than opening an envelope.
 *
 * No `"use client"` here any more: with the flaps gone this section renders on
 * the server, and only the rangoli and the reveal ship JavaScript.
 */
export default function Invitation() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-xl px-6">
        <div className="relative flex items-center justify-center">
          {/* Sits outside the words, so nothing has to be masked away. */}
          <InvitationFrame className="pointer-events-none absolute inset-x-0 inset-y-6" />


          <Reveal className="relative px-2 py-16 text-center sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Together with their families
            </p>
            <p className="mt-6 font-display text-4xl leading-tight text-primary sm:text-5xl">
              {site.groom} <span className="text-gold">&amp;</span> {site.bride}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              request the pleasure of your company
            </p>
            <Ornament className="mx-auto mt-7" />
            <p className="mt-7 font-display text-2xl text-gold">{site.dateLabel}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {site.venue.name} · {site.placeLabel}
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-gold">{site.hashtag}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
