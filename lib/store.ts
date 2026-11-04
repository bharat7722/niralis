import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");

export type Rsvp = {
  id: string;
  name: string;
  phone: string;
  email: string;
  attending: "yes" | "no";
  guests: number;
  meal: string;
  message: string;
  createdAt: string;
};

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

async function readCollection<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    // No file yet (or unreadable) — treat as an empty collection.
    return [];
  }
}

async function writeCollection<T>(file: string, rows: T[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(rows, null, 2), "utf8");
}

export async function listRsvps(): Promise<Rsvp[]> {
  return readCollection<Rsvp>("rsvps.json");
}

export async function addRsvp(rsvp: Rsvp): Promise<void> {
  const rows = await listRsvps();
  rows.push(rsvp);
  await writeCollection("rsvps.json", rows);
}

export async function listGuestbook(): Promise<GuestbookEntry[]> {
  const rows = await readCollection<GuestbookEntry>("guestbook.json");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addGuestbookEntry(entry: GuestbookEntry): Promise<void> {
  const rows = await readCollection<GuestbookEntry>("guestbook.json");
  rows.push(entry);
  await writeCollection("guestbook.json", rows);
}
