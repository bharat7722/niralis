import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/countdown";
import ScratchReveal from "@/components/scratch-reveal";
import Reveal from "@/components/reveal";
import Hero from "@/components/hero";
import Invitation from "@/components/invitation";
import Jharokha from "@/components/jharokha";
import InlayMosaic from "@/components/inlay-mosaic";
import { homeGallery, site } from "@/lib/site";
import Ornament from "@/components/ornament";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="bg-paper border-y border-gold/20 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              The big day arrives in
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-7">
            <ScratchReveal hint="Scratch to reveal" subHint="the date &amp; countdown">
              <p className="font-display text-4xl leading-none text-primary sm:text-5xl">
                {site.dateLabel}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {site.weekday}
              </p>
              <div className="mx-auto my-7 h-px w-24 gold-rule" />
              <Countdown />
            </ScratchReveal>
          </Reveal>
        </div>
      </section>

      <Invitation />

      <Jharokha />

      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Moments</p>
            <h2 data-varak className="mt-3 font-display text-4xl text-primary">Our Gallery</h2>
            <Ornament className="mx-auto mt-6" />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {homeGallery.map((photo, index) => (
              <Reveal key={photo.src} variant="scale" delay={index * 70}>
                <figure className="overflow-hidden rounded-2xl border border-gold/25">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={600}
                  height={800}
                  sizes="(min-width: 640px) 33vw, 50vw"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </figure>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center rounded-full border border-gold/60 px-6 py-2 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-gold/10"
            >
              View full gallery
            </Link>
          </Reveal>
        </div>
      </section>

      <InlayMosaic src="/images/couple-night-lights.jpg" alt="Harsh and Nirali together" />

      <section className="bg-paper py-20">
        <div className="mx-auto grid max-w-4xl gap-6 px-6 sm:grid-cols-2">
          <Reveal>
            <Link
              href="/rsvp"
              className="group block h-full rounded-3xl border border-gold/30 bg-card p-10 text-center transition-all hover:-translate-y-0.5 hover:border-gold/60 active:scale-[0.99]"
            >
              <h3 className="font-display text-3xl text-primary">Aagman Confirmation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us if you can come, and how many people are joining you.
              </p>
              <span className="mt-5 inline-block text-xs uppercase tracking-[0.25em] text-gold transition-transform group-hover:translate-x-1">
                Reply now →
              </span>
            </Link>
          </Reveal>
          <Reveal delay={110}>
            <Link
              href="/guestbook"
              className="group block h-full rounded-3xl border border-gold/30 bg-card p-10 text-center transition-all hover:-translate-y-0.5 hover:border-gold/60 active:scale-[0.99]"
            >
              <h3 className="font-display text-3xl text-primary">Leave a Wish</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Write a wish, blessing or piece of advice for {site.groom} &amp; {site.bride}.
              </p>
              <span className="mt-5 inline-block text-xs uppercase tracking-[0.25em] text-gold transition-transform group-hover:translate-x-1">
                Write a wish →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
