import { site } from "@/lib/site";
import Ornament from "@/components/ornament";

export default function SiteFooter() {
  return (
    <footer className="bg-paper border-t border-gold/20">
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <Ornament className="mx-auto mb-5" />
        <p className="font-display text-2xl text-primary">
          {site.groom} <span className="text-gold">&amp;</span> {site.bride}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {site.tagline}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">{site.dateAndPlace}</p>
        <p className="mt-6 text-[11px] text-muted-foreground/70">
          We can’t wait to celebrate with you.
        </p>
      </div>
    </footer>
  );
}
