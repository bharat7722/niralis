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

  // Saved locally first, and that is what makes the reply recorded. The sheet
  // is a mirror for the couple to work from; a guest who pressed Send must
  // never be told their RSVP failed because a Google script was slow.
  await addRsvp(rsvp);

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

  // Reported so the couple can tell a quiet sheet from an empty one, and so a
  // failed mirror is visible in logs rather than silent. The guest's reply is
  // recorded either way, so this never changes the status code.
  return NextResponse.json({ ok: true, rsvp, sheet }, { status: 201 });
}
