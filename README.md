# Moodle Archive

## Get the extension in [Chrome](https://chromewebstore.google.com/detail/fnhkaidabjeciifnkipdeodjdmheejpj?utm_source=item-share-cb)  or  [Firefox](https://addons.mozilla.org/en-US/firefox/addon/moodle-archive/)

A browser extension for Chrome and Firefox (Manifest V3) that downloads the files from a Moodle course
and keeps a full version history of them — entirely inside the browser, with no
server, no account, and no folder permissions.

Open a course in Moodle, click the extension icon, press **Download**, and every
file gets crawled, hashed, and stored in the browser's own IndexedDB. Download
the same course again later and only what actually changed gets a new version —
everything else is deduplicated by content hash.

## Features

- **One-click course download** — crawls a Moodle course page (including
  folders, sub-resources, and each assignment's files: its statement and what you
  handed in) and pulls down every file it finds, two at a time by default (up to
  four, under **Simultaneous downloads** in the course list's ⋮ menu).
- **Nothing saved halfway** — a download is saved only once every file has come
  down. A connection that drops for a moment is retried on its own; one that
  stays down, or Moodle asking you to log in again, cancels the download and
  leaves the course exactly as it was. A file Moodle no longer has (or no longer
  lets you open) is left out, rather than saved as its error page.
- **Ignore files and folders** — ignored ones aren't downloaded again, and keep
  the versions you already have.
- **Search** — inside a course, just start typing to find files and folders by
  name; a folder whose name matches shows with everything in it.
- **Version history per file** — every time a file's content changes, a new
  version is kept; unchanged files aren't re-stored.
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
storage. Nothing ever leaves your device, except for the files the browser itself
writes to your Downloads folder when you ask it to (via **Download**,
**Backup / restore**, or opening a file).

### Why each permission is needed

| Permission | Why it's needed |
|---|---|
| `activeTab` | Grants temporary access to the current tab only when you click **Download**, instead of requesting broad access to every website. |
| `scripting` | Injects the crawler script into the active tab on demand, to read the course page and find its files. |
| `tabs` | Reads the active tab's URL to confirm it's a Moodle course page, and lets the popup and dashboard communicate with it. |
| `downloads` | Saves fetched files — and full backup `.zip` exports, if you use that feature — to your Downloads folder. |
| `downloads.open` | Lets you open a previously downloaded file straight from the extension's history view. Chrome only: Firefox lets an extension open a download only right from the click, so there the file is left in Firefox's downloads instead, and the permission isn't requested. |
| `storage` | Keeps the progress of a running download in session storage (cleared when the browser closes), so the popup shows where things stand if you close and reopen it mid-download, and the few settings the Moodle tab reads while downloading (language and simultaneous downloads) in local storage. |
| `unlimitedStorage` | Lifts the size limit on the extension's local database and stops Chrome from clearing it on its own when the disk runs low, which would otherwise erase your version history without warning. Nothing is stored anywhere but on your device. |

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

Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/fnhkaidabjeciifnkipdeodjdmheejpj),
or from source:

```sh
git clone https://github.com/slvdr510/moodle-archive.git
cd moodle-archive
npm install
npm run build:chrome    # Chrome, into dist-chrome/
npm run build:firefox   # Firefox (140 or later), into dist-firefox/
```

Then in Chrome:

1. Go to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist-chrome/` folder produced by the build.

Or in Firefox:

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `dist-firefox/manifest.json`.

Firefox removes a temporary add-on when it closes, so this is for trying it out.

## Usage

1. Open a Moodle course page.
2. Click the Moodle Archive icon in the toolbar, then **Download**.
3. Click **History** to open the dashboard and browse tracked courses, files,
   and versions.

Re-running **Download** on the same course later only stores what changed. The
download keeps running if you close the popup; reopening it shows the current
progress. If the Moodle tab is closed or navigates away mid-download, the
download is reported as interrupted. Then — as when the connection stays down,
or Moodle asks you to log in again — nothing from that download is saved, and
the course stays as it was.

A download goes to its course by the course's URL in Moodle, so every Moodle
site is apart, subdomain included: `aulasvirtuales.uhu.es` and
`2024aulasvirtuales.uhu.es` are two sites, and a course in each is a course of
its own, even with the same number or title. If a course moves, as when its
site changes domain, set its new URL in **Edit course info**: downloads from
there then go to it, and its old URLs still work.

**Edit course info**, in a course's ⋮ menu (on its card or row) or in the
course list's, lists every course, hidden ones too, as a block each: its tag,
full name, institution, academic year (any text, such as 26-27, shown as you
write it, as a label in that year's own color: one at random for a new year, which
you can change beside its field), URL and color. Opened from a course, that course's block is shown first.
The institution and academic year fields offer the ones already set on other
courses, or add a new one; deleting one from that list (its bin, or Delete on it)
takes it off every course that has it, after asking. A color's circle (the year's,
or the rainbow one after the course color swatches) opens a small menu to write
its code, such as FFFFFF (or FFF), or pick it in the browser's own color picker.
There's no Save: a field is
stored as you leave it or press Enter in it, and what you pick from a list or a
color as you pick it. Esc, the × or a click outside closes it.

**Appearance**, in the course list's ⋮ menu, sets the interface's own colors —
background, text, borders, buttons and links, the keyboard's focus, and the
colors that mark files as new, changed, deleted or unchanged — for the light
theme and the dark one apart (the page shows the one being set while it's
open). To start from, there are palettes — Default, Ocean, Forest, Lavender,
Warm and High contrast — each with a light version and a dark one (it asks
before one replaces colors you set yourself). Each color is set as a course color is, from its circle, and goes back to the
default from the arrow beside it; **Reset colors** takes a whole theme back.
Text on a color you pick turns dark if the color is too light for white. The
colors are kept in this browser, like the other settings, not in backups.

To add a file yourself, open a course in the dashboard and drop the file onto
the page (or choose **Add file…** from the course's menu), then pick its
folder. Same name in the same folder = a new version of that file; a new name =
a new file tagged **Manual**.

Files the dashboard can't show itself (anything but PDFs, images and text) are
downloaded and opened with your system's app. In Firefox they're only
downloaded: open them from Firefox's downloads, in the toolbar.

To back up your courses or move them to another browser, see
[Exporting and importing courses](#exporting-and-importing-courses).

## Exporting and importing courses

A backup is a single `.zip` file with everything Moodle Archive knows about the
courses in it, saved to your Downloads folder. Importing it — in the same
browser or in another one — brings it all back.

### What a backup contains

- **The courses**, with everything you set on them: tag (abbreviation), full
  name, institution, academic year, color, and ignored files and folders.
- **Every file** of those courses, including the ones you added yourself.
- **Every version** of every file, with its content — not just the latest.
- **The recently opened** files of those courses.

Not included: whether a course is hidden (a backup always saves it as shown),
and settings that belong to your browser rather than to any course — theme,
language, card or row view, side margins, date format, download names,
simultaneous downloads and the recently opened settings.

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
  name, institution, academic year, color, ignored files, every file and every
  version. It shows in the list (even if it was hidden when exported), and its
  files start out as the baseline, with no **New** badges.
- **A course it already has** is merged into the one you have, never duplicated:
  - Its files are compared by content. A file you don't have yet is added
    (marked **New**); one whose content you don't have yet gets it as a new
    version. Every older version from the backup is added
    too, and nothing you already have is stored twice.
  - **Nothing is ever deleted or overwritten.** Files you have that aren't in
    the backup stay as they are.
  - **What you set here wins:** the tag, full name, institution, academic year
    and color you gave the course in this browser stay as they are, and so do
    its position in the list and whether it's hidden. Whatever isn't set here is filled in from
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
npm run dev              # Asks: Chrome (Enter) or Firefox (↓, Enter), then runs one of:
npm run dev:chrome       #   Vite dev server, into dist-chrome-dev/
npm run dev:firefox      #   Firefox build into dist-firefox-dev/, rebuilt on change
npm run build            # Asks: both (Enter), Chrome (↓) or Firefox (↓↓), then runs:
npm run build:chrome     #   Chrome production build into dist-chrome/
npm run build:firefox    #   Firefox production build into dist-firefox/
npm run typecheck        # tsc, no emit
npm test                 # vitest
npm run package          # Asks the same as build, then runs:
npm run package:chrome   #   Chrome build, zipped for the Chrome Web Store: moodle-archive-chrome.zip
npm run package:firefox  #   Firefox build, zipped for addons.mozilla.org: moodle-archive-firefox.zip
npm run package:source   # The committed source, for addons.mozilla.org's review: moodle-archive-firefox-source-code.zip
```

`npm run dev:chrome` writes the extension into `dist-chrome-dev/`, for Chrome's
**Load unpacked**, and also rebuilds the content script there as `src/content/`
changes, in watch mode alongside the dev server.

`npm run dev:firefox` builds the Firefox version into `dist-firefox-dev/` and
rebuilds it on every change. Load it in Firefox from
`about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** →
`dist-firefox-dev/manifest.json`, and press **Reload** there after a rebuild.
Flatpak's Firefox can only read the file picked, not the rest of the folder: give
it access to the project first, then restart it —
`flatpak override --user --filesystem="$PWD:ro" org.mozilla.firefox`.

### Building the Firefox version from source

The Firefox package is bundled and minified, so addons.mozilla.org reviews it
from this source. To build it:

1. Install Node.js 24 (built with 24.12.0) and npm 11. Any operating system
   works.
2. In the source folder, run `npm ci` and then `npm run build:firefox`.

The result, in `dist-firefox/`, is the content of the submitted package, file
for file. The icons are committed as PNGs, so this build doesn't redraw them
from `src/icons/icon.svg` (`npm run build:chrome` does, with `rsvg-convert`).

The bundle includes, unmodified from npm: Preact, JSZip (with its
`setimmediate` dependency), idb and the Inter font.

### Project layout

- `src/content/` — the content script that crawls and downloads a course's
  files from the Moodle page itself (it needs to run in that page's origin to
  reuse the user's session).
- `src/background/` — the background script (a service worker in Chrome, an
  event page in Firefox): receives the crawled files,
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

The file and folder icons come from the
[Material Icon Theme](https://github.com/material-extensions/vscode-material-icon-theme)
for VS Code, under the MIT License — see
[THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt).
