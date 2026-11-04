/**
 * Appending a row to a Google Sheet, through an Apps Script web app.
 *
 * The couple wants replies in a spreadsheet they can sort, filter and hand to
 * a caterer. A bound Apps Script is the shortest honest path there: no service
 * account, no private key in the repo, no extra dependency -- one URL and one
 * shared secret in the environment.
 *
 * **Nothing here is allowed to lose an RSVP.** The caller writes to its own
 * store first and treats this as a best-effort mirror: a guest who pressed
 * Send must never be told their reply failed because a Google script was slow.
 * So every failure is reported as a value, never thrown.
 *
 * **Unconfigured is a normal state, not an error.** With no URL set the
 * function does nothing, makes no network call and says so -- the site keeps
 * working exactly as it did before the sheet existed.
 */

export type SheetResult = "appended" | "not_configured" | "failed";

/** How long to wait on Apps Script before giving up. It is a human-facing
 *  form submit, and the row is already saved locally by the time we get here. */
const TIMEOUT_MS = 10_000;

export async function appendToSheet(
  sheet: string,
  row: Record<string, string | number>,
): Promise<SheetResult> {
  const endpoint = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const token = process.env.GOOGLE_SHEETS_TOKEN;

  if (!endpoint) return "not_configured";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sheet, row }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Apps Script answers the POST with a 302 to its script.googleusercontent
      // host; without following it the append still happens but we cannot read
      // the result, and a bare 302 would read as a failure.
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(
        `[sheets] ${sheet}: Apps Script replied ${response.status}. ` +
          "The row is still saved locally.",
      );
      return "failed";
    }
    return "appended";
  } catch (cause) {
    // Timeout, DNS, offline, a revoked deployment -- all the same from here:
    // the mirror did not happen and the local row is the record.
    console.error(`[sheets] ${sheet}: could not reach Apps Script.`, cause);
    return "failed";
  }
}
