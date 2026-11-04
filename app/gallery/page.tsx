import type { Metadata } from "next";
import GalleryGrid from "@/components/gallery-grid";
import PhotoDeck from "@/components/photo-deck";
import Reveal from "@/components/reveal";
import { gallery, site } from "@/lib/site";
import Ornament from "@/components/ornament";

export const metadata: Metadata = {
  title: "Gallery — Harsh & Nirali",
  description: "Photographs from Harsh and Nirali’s journey together.",
};

export default function GalleryPage() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{site.hashtag}</p>
          <h1 data-varak className="mt-3 font-display text-5xl text-primary">Gallery</h1>
          <Ornament className="mx-auto mt-6" />
        </Reveal>

        <PhotoDeck photos={gallery.slice(0, 6)} />

        <GalleryGrid photos={gallery} />
      </div>
    </section>
  );
}
