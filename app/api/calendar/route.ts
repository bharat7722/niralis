import { buildWeddingCalendar } from "@/lib/ics";

export async function GET() {
  // Served as a download so phones hand it straight to the calendar app.
  return new Response(buildWeddingCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="harsh-and-nirali.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
