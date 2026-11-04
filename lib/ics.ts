import { DEFAULT_EVENT_MINUTES, IST_OFFSET_MINUTES, schedule, site } from "@/lib/site";

/** RFC 5545 escaping for TEXT values. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Content lines are folded at 75 octets, continuations starting with a space. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest) parts.push(" " + rest);
  return parts.join("\r\n");
}

function toUtcStamp(date: Date): string {
  return `${date.toISOString().slice(0, 19).replace(/[-:]/g, "")}Z`;
}

/** "2027-02-10T09:00" is an India local time; shift it to UTC. */
function istToUtc(local: string, addMinutes = 0): Date {
  const [datePart, timePart] = local.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(utcMs - IST_OFFSET_MINUTES * 60_000 + addMinutes * 60_000);
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildWeddingCalendar(): string {
  const stamp = toUtcStamp(new Date());

  const events = schedule.flatMap((day) =>
    day.events.map((event) => {
      const lines = [
        "BEGIN:VEVENT",
        `UID:${slug(event.name)}-${slug(site.hashtag)}@wedding.invite`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${toUtcStamp(istToUtc(event.start))}`,
        `DTEND:${toUtcStamp(istToUtc(event.start, DEFAULT_EVENT_MINUTES))}`,
        `SUMMARY:${escapeText(`${event.name} — ${site.groom} & ${site.bride}`)}`,
        `DESCRIPTION:${escapeText(event.description)}`,
        `LOCATION:${escapeText(site.venue.address)}`,
        "END:VEVENT",
      ];
      return lines.map(fold);
    }),
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.groom} & ${site.bride}//Wedding//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`${site.groom} & ${site.bride} — Wedding`)}`,
    ...events.flat(),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** A single "add to Google Calendar" link covering the ceremony itself. */
export function googleCalendarUrl(): string {
  const ceremony = schedule.at(-1)?.events.at(-1);
  const start = ceremony ? istToUtc(ceremony.start) : istToUtc(site.weddingDate.slice(0, 16));
  const end = ceremony
    ? istToUtc(ceremony.start, DEFAULT_EVENT_MINUTES)
    : istToUtc(site.weddingDate.slice(0, 16), DEFAULT_EVENT_MINUTES);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${site.groom} & ${site.bride} — Wedding`,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: `${site.hashtag} — ${site.tagline}`,
    location: site.venue.address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
