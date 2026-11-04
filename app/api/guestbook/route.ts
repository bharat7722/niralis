import { NextResponse, connection } from "next/server";
import { addGuestbookEntry, listGuestbook, type GuestbookEntry } from "@/lib/store";
import { appendToSheet } from "@/lib/sheets";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET() {
  // Notes are read fresh on every request rather than prerendered.
  await connection();
  const entries = await listGuestbook();
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = clean(body.name, 100);
  const message = clean(body.message, 1000);

  if (!name || !message) {
    return NextResponse.json(
      { error: "Please add both your name and a message." },
      { status: 400 },
    );
  }

  const entry: GuestbookEntry = {
    id: crypto.randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
  };

  // Same two stores as the RSVP route, for the same reason: the file store is
  // development-only, so in production the sheet is what actually keeps a wish.
  const savedLocally = await addGuestbookEntry(entry);

  const sheet = await appendToSheet("Guestbook", {
    submittedAt: entry.createdAt,
    name: entry.name,
    message: entry.message,
    id: entry.id,
  });

  if (!savedLocally && sheet !== "appended") {
    console.error(`[guestbook] nowhere to record ${entry.name}: sheet=${sheet}`);
    return NextResponse.json(
      { error: "We could not save your wish just now. Please try again in a moment." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, entry, sheet }, { status: 201 });
}
