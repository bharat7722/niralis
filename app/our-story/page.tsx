import type { Metadata } from "next";
import Reveal from "@/components/reveal";
import Rangoli from "@/components/rangoli";
import StoryBook from "@/components/story-book";
import Corridor from "@/components/corridor";
import { storyChapters } from "@/lib/site";
import Ornament from "@/components/ornament";

export const metadata: Metadata = {
  title: "Our Story — Harsh & Nirali",
  description: "How Harsh and Nirali got here, one chapter at a time.",
};

export default function OurStoryPage() {
  return (
    <>
      <Corridor />

      <section className="bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">How we got here</p>
          <h1 data-varak className="mt-3 font-display text-5xl text-primary">Our Story</h1>
          <Ornament className="mx-auto mt-6" />
        </Reveal>

        <StoryBook chapters={storyChapters} />

        <div className="relative mt-32 flex items-center justify-center">
          <Rangoli className="pointer-events-none absolute w-[min(88vw,440px)]" />
          <Reveal className="relative py-20 text-center">
            <Ornament className="mx-auto" />
            <p className="mt-8 font-display text-3xl italic text-primary">
              “…and so, forever begins.”
            </p>
          </Reveal>
        </div>
      </div>
      </section>
    </>
  );
}
