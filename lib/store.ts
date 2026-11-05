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

/**
 * Returns whether the write landed, and never throws.
 *
 * On a serverless host the project directory is read-only — every write here
 * fails with EROFS. This used to propagate out of the route as a 500, which
 * meant a guest's reply was rejected *and* the Google Sheet mirror below it
 * never ran. The file store is a local convenience; it is not allowed to take
 * a submission down with it.
 */
async function writeCollection<T>(file: string, rows: T[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(rows, null, 2), "utf8");
    return true;
  } catch (cause) {
    console.error(`[store] could not write ${file}; relying on the sheet.`, cause);
    return false;
  }
}

export async function listRsvps(): Promise<Rsvp[]> {
  return readCollection<Rsvp>("rsvps.json");
}

export async function addRsvp(rsvp: Rsvp): Promise<boolean> {
  const rows = await listRsvps();
  rows.push(rsvp);
  return writeCollection("rsvps.json", rows);
}

export async function listGuestbook(): Promise<GuestbookEntry[]> {
  const rows = await readCollection<GuestbookEntry>("guestbook.json");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addGuestbookEntry(entry: GuestbookEntry): Promise<boolean> {
  const rows = await readCollection<GuestbookEntry>("guestbook.json");
  rows.push(entry);
  return writeCollection("guestbook.json", rows);
}
