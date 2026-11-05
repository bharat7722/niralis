# RSVP → Google Sheet

Replies land in a Google Sheet through a small Apps Script bound to that
sheet. No Google Cloud project, no service account, no private key in the
repo — one URL and one shared secret in `.env.local`.

**The sheet is a mirror, not the record.** Every RSVP is written to
`.data/rsvps.json` first and the guest is told it worked. If the sheet is
unreachable the reply is still safe; the failure shows up in the server log
and in the `sheet` field of the API response (`appended` / `failed` /
`not_configured`).

---

## 1. Make the sheet

Create a new Google Sheet. Rename the first tab to **`RSVP`** (exactly that —
the script looks it up by name and creates it if missing, but matching keeps
things predictable).

## 2. Add the script

In that sheet: **Extensions → Apps Script**. Delete whatever is in
`Code.gs` and paste this:

```javascript
// Shared secret. Must match GOOGLE_SHEETS_TOKEN in .env.local.
// Change it to something only you know before deploying.
const TOKEN = 'change-me-to-something-random';

// Column order, per tab. A wish only has two fields, so the Guestbook tab
// gets two columns -- sharing one list across both tabs is what left it with
// empty phone/email/attending/guests columns.
const COLUMNS = {
  RSVP: [
    'submittedAt', 'name', 'phone', 'email',
    'attending', 'guests', 'message',
  ],
  Guestbook: ['name', 'message'],
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Without this, anyone who learns the deployment URL can append rows.
    if (payload.token !== TOKEN) {
      return json({ ok: false, error: 'bad token' });
    }

    const book = SpreadsheetApp.getActiveSpreadsheet();
    const name = payload.sheet || 'RSVP';
    const columns = COLUMNS[name] || COLUMNS.RSVP;

    let tab = book.getSheetByName(name);
    if (!tab) tab = book.insertSheet(name);

    // Header row, written once, so a fresh sheet is readable immediately.
    if (tab.getLastRow() === 0) {
      tab.appendRow(columns);
      tab.getRange(1, 1, 1, columns.length).setFontWeight('bold');
      tab.setFrozenRows(1);
    }

    const row = payload.row || {};
    tab.appendRow(columns.map(function (key) {
      return row[key] === undefined || row[key] === null ? '' : row[key];
    }));

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Change `TOKEN` to something random — it is the only thing standing between
your sheet and anyone who learns the URL.

## 3. Deploy it

**Deploy → New deployment → gear icon → Web app**, then:

| Field | Value |
|---|---|
| Description | anything, e.g. `RSVP intake` |
| Execute as | **Me** |
| Who has access | **Anyone** |

"Anyone" is required — the website calls this without a Google login. That is
why the token exists.

Authorise when prompted (it will warn that the script is unverified; it is
your own script). Copy the **Web app URL**, which looks like:

```
https://script.google.com/macros/s/AKfycb.../exec
```

## 4. Point the site at it

Create `.env.local` in the project root:

```bash
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
GOOGLE_SHEETS_TOKEN=the-same-token-you-put-in-the-script
```

Restart `npm run dev`. `.env.local` is already gitignored by `create-next-app`
— keep it that way, the token is a secret.

## 5. Check it

Submit a test RSVP. A row should appear in the sheet within a second or two.
If it does not, the dev server log says why — `[sheets] RSVP: ...`.


## Changing the columns

Edit the tab's list in `COLUMNS` in the script **and** the object passed to
`appendToSheet` in the matching route handler. Keys that exist in one and not
the other come through blank rather than breaking.

The header row is only written to an empty tab. After changing a tab's
columns, delete that tab (or clear every row including the header) so the
script writes the new header on the next submission.

## Re-deploying after editing the script

Apps Script keeps serving the deployed version, not the saved one. After an
edit: **Deploy → Manage deployments → pencil → Version: New version → Deploy**.
The URL stays the same.

## Adding the guestbook too

The helper is generic. In `app/api/guestbook/route.ts`, after the entry is
saved:

```ts
await appendToSheet("Guestbook", {
  submittedAt: entry.createdAt,
  name: entry.name,
  message: entry.message,
  id: entry.id,
});
```

The script creates a `Guestbook` tab on the first row, but its `COLUMNS` list
is shared — give each sheet its own list if the shapes differ.
