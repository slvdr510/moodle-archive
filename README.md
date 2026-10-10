# Moodle Archive

[Chrome web store link](https://chromewebstore.google.com/detail/fnhkaidabjeciifnkipdeodjdmheejpj?utm_source=item-share-cb)

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
  any file straight to your Downloads folder, current or historical. Previews
  live at a stable extension URL per version, so a restored tab still works
  after restarting the browser.
- **Add your own files** — drag files onto a course (or pick them) and choose
  the folder they go in: the course root, an existing folder, or a new one. A
  file with the same name as one already in that folder is added as a new
  version of it, so nothing is overwritten. A file with a new name is tagged
  **Manual**, and later downloads never mark it as deleted, since Moodle never
  had it.
- **Download a folder as a zip, or delete files and folders** — from any
  folder or file row in the dashboard.
- **Recently opened** — quick access back to the last files you opened in a
  course.
- **Backup / restore** — export one course or all of them (with their settings,
  files and every version's content) to a single `.zip` in your Downloads
  folder, and import it back later or on another machine. Importing a course
  you already have merges it in without overwriting anything — see
  [Exporting and importing courses](#exporting-and-importing-courses).
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
| `storage` | Keeps the progress of a running download in session storage (cleared when the browser closes), so the popup shows where things stand if you close and reopen it mid-download. |

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

Re-running **Download** on the same course later only stores what changed. The
download keeps running if you close the popup; reopening it shows the current
progress. If the Moodle tab is closed or navigates away mid-download, the
download is reported as interrupted.

To add a file yourself, open a course in the dashboard and drop the file onto
the page (or choose **Add file…** from the course's menu), then pick its
folder. Same name in the same folder = a new version of that file; a new name =
a new file tagged **Manual**.

To back up your courses or move them to another browser, see
[Exporting and importing courses](#exporting-and-importing-courses).

## Exporting and importing courses

A backup is a single `.zip` file with everything Moodle Archive knows about the
courses in it, saved to your Downloads folder. Importing it — in the same
browser or in another one — brings it all back.

### What a backup contains

- **The courses**, with everything you set on them: tag (abbreviation), full
  name, institution, color, and ignored files and folders.
- **Every file** of those courses, including the ones you added yourself.
- **Every version** of every file, with its content — not just the latest.
- **The recently opened** files of those courses.

Not included: whether a course is hidden (a backup always saves it as shown),
and settings that belong to your browser rather than to any course — theme,
language, card or row view, side margins, date format, download names and the
recently opened settings.

### Exporting

- **One course:** open the course's ⋮ menu (on its card or row, or inside the
  course) and choose **Export**. The file is named
  `moodle-archive-course_<course>_<date>.zip`.
- **Every course:** in the course list's ⋮ menu, choose **Export all courses**.
  The file is named `moodle-archive-backup_<date>.zip`.

Either way you're asked to confirm first, and the `.zip` lands in your
Downloads folder.

### Importing

Drop one or several backup `.zip` files anywhere on the course list, or choose
**Import course(s)** in the course list's ⋮ menu (it accepts several files at
once). A message then tells you how many courses, files and versions were
imported. A file that isn't a Moodle Archive backup is skipped with a notice,
without importing anything from it — and the other files still import.

What happens to each course in the backup depends on whether this browser
already has it:

- **A course it doesn't have** is added exactly as it was exported — tag, full
  name, institution, color, ignored files, every file and every version. It
  shows in the list (even if it was hidden when exported), and its files start
  out as the baseline, with no **New** badges.
- **A course it already has** is merged into the one you have, never duplicated:
  - Its files are compared by content. A file you don't have yet is added
    (marked **New**); one whose content you don't have yet gets it as a new
    version. Every older version from the backup is added
    too, and nothing you already have is stored twice.
  - **Nothing is ever deleted or overwritten.** Files you have that aren't in
    the backup stay as they are.
  - **What you set here wins:** the tag, full name, institution and color you
    gave the course in this browser stay as they are, and so do its position in
    the list and whether it's hidden. Whatever isn't set here is filled in from
    the backup — so a full name or a color set on another computer reaches this
    one too.
  - **Ignored files and folders** from both are kept, each one once.

How a course is recognized as one this browser already has: by an internal
identifier it gets the first time it's downloaded, which a backup carries with
it — not by its name, so renaming a course on either side doesn't matter. A
consequence: if the same Moodle course was downloaded separately in two
browsers, each has its own identifier, and importing one into the other adds
it as a second course. To keep a single copy across browsers, download the
course in one of them and import it into the others.

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
- `src/viewer/` — the page that previews a stored version (PDF, image or text)
  at a stable `?version=<id>` URL, re-reading it from IndexedDB on every load.
- `src/lib/` — shared, testable logic (hashing, diffing, storage, file-type
  detection, backup/restore, etc.) used by more than one of the above.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free to use, modify, and share for
any noncommercial purpose. Selling it, or using it as part of a paid product
or service, is not permitted.
