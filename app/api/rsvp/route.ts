import { NextResponse } from "next/server";
import { addRsvp, type Rsvp } from "@/lib/store";
import { appendToSheet } from "@/lib/sheets";

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = clean(body.name, 100);
  const attending = body.attending === "no" ? "no" : body.attending === "yes" ? "yes" : null;

  if (!name) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!attending) {
    return NextResponse.json({ error: "Please let us know if you can join us." }, { status: 400 });
  }

  const parsedGuests = Number.parseInt(clean(body.guests, 4), 10);
  const guests = Number.isFinite(parsedGuests) ? Math.min(Math.max(parsedGuests, 1), 15) : 1;

  const rsvp: Rsvp = {
    id: crypto.randomUUID(),
    name,
    phone: clean(body.phone, 40),
    email: clean(body.email, 120),
    attending,
    guests: attending === "yes" ? guests : 0,
    meal: clean(body.meal, 60) || "Vegetarian",
    message: clean(body.message, 1000),
    createdAt: new Date().toISOString(),
  };

  // Both stores are attempted, and neither may throw. The file store only
  // works in development — a serverless filesystem is read-only — so in
  // production the sheet is the record and this is a no-op.
  const savedLocally = await addRsvp(rsvp);

  const sheet = await appendToSheet("RSVP", {
    submittedAt: rsvp.createdAt,
    name: rsvp.name,
    phone: rsvp.phone,
    email: rsvp.email,
    attending: rsvp.attending === "yes" ? "Yes" : "No",
    guests: rsvp.guests,
    meal: rsvp.meal,
    message: rsvp.message,
    id: rsvp.id,
  });

  // If nothing captured the reply, say so. Returning 201 here would show the
  // guest a thank-you for an RSVP that reached no one — the one outcome worth
  // failing loudly for.
  if (!savedLocally && sheet !== "appended") {
    console.error(`[rsvp] nowhere to record ${rsvp.name}: sheet=${sheet}`);
    return NextResponse.json(
      { error: "We could not save your reply just now. Please try again in a moment." },
      { status: 503 },
    );
  }

  // Otherwise it is recorded. `sheet` is reported so a quiet sheet can be told
  // apart from an empty one.
  return NextResponse.json({ ok: true, rsvp, sheet }, { status: 201 });
}
