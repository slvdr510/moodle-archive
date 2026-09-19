# Moodle Archive

A Chrome extension (Manifest V3) that downloads the files from a Moodle course
and keeps a full version history of them — entirely inside the browser, with no
server, no account, and no folder permissions.

Open a course in Moodle, click the extension icon, press **Download**, and every
file gets crawled, hashed, and stored in the browser's own IndexedDB. Download
the same course again later and only what actually changed gets a new version —
everything else is deduplicated by content hash.

## Features

- **One-click course download** — crawls a Moodle course page (including
  folders and sub-resources) and pulls down every file it finds.
- **Version history per file** — every time a file's content changes, a new
  version is kept; unchanged files aren't re-stored.
- **Diff viewer** — compare any two versions of a text file side by side.
- **Open or download any version** — preview images/PDFs/text inline, or send
  any file straight to your Downloads folder, current or historical.
- **Recently opened** — quick access back to the last files you opened in a
  course.
- **Backup / restore** — export everything (courses, files, every version's
  content) to a single `.zip` in your Downloads folder, and import it back
  later or on another machine.
- **Drag-and-drop course ordering, light/dark/system theme, configurable date
  format** — small dashboard touches that don't need their own section.

## Why this exists

Moodle's own UI doesn't keep history — re-uploaded slides, updated exam
guidelines, and corrected assignment sheets silently overwrite whatever was
there before. This extension keeps every version it has ever seen, entirely
offline and local to your machine.

## Privacy & permissions

Moodle Archive does not collect, transmit, or sell any personal data. It has
no backend server, no analytics, and no third-party integrations of any kind.

When you click **Download** on a Moodle course page, the extension reads the
content of that page (file names, links, and folder structure) to find the
files it needs to fetch. That content — along with the files themselves and
their version history — is stored **only** in your browser's local IndexedDB
storage. Nothing ever leaves your device, except for the files Chrome itself
writes to your Downloads folder when you ask it to (via **Download**,
**Backup / restore**, or opening a file).

### Why each permission is needed

| Permission | Why it's needed |
|---|---|
| `activeTab` | Grants temporary access to the current tab only when you click **Download**, instead of requesting broad access to every website. |
| `scripting` | Injects the crawler script into the active tab on demand, to read the course page and find its files. |
| `tabs` | Reads the active tab's URL to confirm it's a Moodle course page, and lets the popup and dashboard communicate with it. |
| `downloads` | Saves fetched files — and full backup `.zip` exports, if you use that feature — to your Downloads folder. |
| `downloads.open` | Lets you open a previously downloaded file straight from the extension's history view. |

### Data storage and retention

All courses, files, and version history are stored in IndexedDB, a local
database built into your browser. This data stays on your device, persists
across browser restarts, and is never synced or uploaded anywhere by the
extension. You can delete it at any time from the dashboard's reset option,
by removing the extension, or by clearing its site data from
`chrome://extensions`.

The optional **Backup / restore** feature lets you export everything to a
`.zip` file that is saved directly to your Downloads folder — again, without
ever being sent to any server.

### Third parties

Moodle Archive does not share data with any third party. It does not use
analytics, tracking, or advertising services of any kind.

Questions about any of this can be raised as an issue on this repository.

## Installing

There's no Chrome Web Store listing (yet) — install it unpacked from source:

```sh
git clone https://github.com/slvdr510/moodle-archive.git
cd moodle-archive
npm install
npm run build
```

Then in Chrome:

1. Go to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist/` folder produced by the build.

## Usage

1. Open a Moodle course page.
2. Click the Moodle Archive icon in the toolbar, then **Download**.
3. Click **History** to open the dashboard and browse tracked courses, files,
   and versions.

Re-running **Download** on the same course later only stores what changed.

## Development

```sh
npm run dev         # Vite dev server for the dashboard/popup UI
npm run build        # Full production build into dist/
npm run typecheck    # tsc, no emit
npm test             # vitest
```

### Project layout

- `src/content/` — the content script that crawls and downloads a course's
  files from the Moodle page itself (it needs to run in that page's origin to
  reuse the user's session).
- `src/background/` — the MV3 service worker: receives the crawled files,
  diffs them against what's already known, and stores new/changed versions in
  IndexedDB.
- `src/dashboard/` — the full-page React UI for browsing courses, files, and
  version history.
- `src/popup/` — the small popup shown when clicking the extension's toolbar
  icon.
- `src/lib/` — shared, testable logic (hashing, diffing, storage, file-type
  detection, backup/restore, etc.) used by more than one of the above.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free to use, modify, and share for
any noncommercial purpose. Selling it, or using it as part of a paid product
or service, is not permitted.
