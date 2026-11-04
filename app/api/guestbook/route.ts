import { NextResponse, connection } from "next/server";
import { addGuestbookEntry, listGuestbook, type GuestbookEntry } from "@/lib/store";

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

  await addGuestbookEntry(entry);
  return NextResponse.json({ ok: true, entry }, { status: 201 });
}
