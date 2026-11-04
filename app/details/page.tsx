import type { Metadata } from "next";
import Reveal from "@/components/reveal";
import { googleCalendarUrl } from "@/lib/ics";
import { dressCode, faqs, mapsUrl, schedule, site } from "@/lib/site";
import Ornament from "@/components/ornament";

export const metadata: Metadata = {
  title: "Wedding Details — Harsh & Nirali",
  description:
    "Venue, schedule of events and dress code for Harsh and Nirali’s wedding.",
};

export default function DetailsPage() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-6">
        <Reveal className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Join us</p>
          <h1 data-varak className="mt-3 font-display text-5xl text-primary">Wedding Details</h1>
          <Ornament className="mx-auto mt-6" />
        </Reveal>

        <Reveal className="mt-14 rounded-3xl border border-gold/30 bg-card p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl text-primary">{site.venue.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {site.venue.city}, {site.venue.state}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {site.venue.address}
          </p>
          <p className="mt-6 font-display text-2xl text-gold">{site.dateAndPlace}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gold/60 px-5 py-2 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-gold/10 active:scale-[0.98]"
            >
              Get directions
            </a>
            {/* A download, so a phone hands it straight to its calendar app. */}
            <a
              href="/api/calendar"
              className="inline-flex items-center justify-center rounded-full border border-gold/60 px-5 py-2 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-gold/10 active:scale-[0.98]"
            >
              Add to calendar
            </a>
            <a
              href={googleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
            >
              Google Calendar
            </a>
          </div>
        </Reveal>

        <div className="mt-14">
          <Reveal>
            <h2 className="text-center font-display text-3xl text-primary">Schedule of Events</h2>
          </Reveal>
          {schedule.map((day) => (
            <Reveal key={day.date} className="mt-8">
              <p className="text-center text-xs uppercase tracking-[0.3em] text-gold">
                {day.date}
              </p>
              <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-gold/25 bg-card px-6 py-7 sm:px-8">
                <div className="relative pl-9">
                  <span
                    aria-hidden="true"
                    className="timeline-rail absolute bottom-3 left-1 top-2 w-px"
                  />
                  {day.events.map((event, index) => (
                    <div
                      key={event.name}
                      className="timeline-item relative pb-7 last:pb-0"
                      style={{ transitionDelay: `${180 + index * 110}ms` }}
                    >
                      <span
                        aria-hidden="true"
                        className="timeline-node absolute -left-9 top-[7px]"
                      />
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gold">
                        {event.time}
                      </p>
                      <h3 className="mt-1 font-display text-xl text-primary">{event.name}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14">
          <Reveal>
            <h2 className="text-center font-display text-3xl text-primary">Dress Code</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {dressCode.map((item, index) => (
              <Reveal key={item.event} variant="scale" delay={index * 80}>
                <div className="h-full rounded-2xl border border-gold/25 bg-card p-6">
                  <h3 className="font-display text-xl text-primary">{item.event}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.attire}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <Reveal>
            <h2 className="text-center font-display text-3xl text-primary">Good to Know</h2>
          </Reveal>
          <Reveal className="mt-8 divide-y divide-gold/20 overflow-hidden rounded-2xl border border-gold/25">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-card px-5 py-4">
                <summary className="cursor-pointer list-none font-display text-lg text-primary">
                  {faq.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
