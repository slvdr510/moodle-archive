import JSZip from 'jszip';
import { courseStore, fileStore, recentOpenStore, versionStore } from './db';
import { guessMimeType } from './fileKind';
import { processEntryBatchForCourse } from './repository';
import type { Course, ExtractedEntry, FileRecord, RecentOpenRecord, VersionRecord } from '../types';

const MANIFEST_VERSION = 1;
const MANIFEST_NAME = 'data.json';
const CONTENT_DIR = 'content';

type VersionMeta = Omit<VersionRecord, 'content'>;

interface BackupManifest {
  version: number;
  exportedAt: number;
  courses: Course[];
  files: FileRecord[];
  versions: VersionMeta[];
  recentOpens: RecentOpenRecord[];
}

function timestampForFilename(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  );
}

async function buildBackupZip(
  courses: Course[],
  files: FileRecord[],
  versions: VersionRecord[],
  recentOpens: RecentOpenRecord[]
): Promise<Blob> {
  const manifest: BackupManifest = {
    version: MANIFEST_VERSION,
    exportedAt: Date.now(),
    // Whether a course happens to be hidden on this browser isn't meaningful
    // to whoever imports it — never persisted in the export itself. Whether an
    // imported course starts hidden is decided at import time instead (see
    // `importAllData`), from what the *importing* browser already has.
    courses: courses.map((c) => ({ ...c, hidden: false })),
    files,
    versions: versions.map(({ content: _content, ...meta }) => meta),
    recentOpens
  };

  const zip = new JSZip();
  zip.file(MANIFEST_NAME, JSON.stringify(manifest));
  const contentFolder = zip.folder(CONTENT_DIR)!;
  for (const version of versions) {
    contentFolder.file(version.id, version.content);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

async function downloadZip(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  await chrome.downloads.download({ url, filename });
  // chrome.downloads.download reads the blob asynchronously in the background;
  // give it plenty of time to finish before freeing the underlying data.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function safeFilenamePart(name: string): string {
  return name.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '') || 'course';
}

/**
 * Bundles every tracked course/file/version (content included) into a single zip
 * and hands it to Chrome's downloads API, so it lands in the browser's default
 * Downloads folder just like any other download.
 */
export async function exportAllData(): Promise<void> {
  const courses = await courseStore.all();
  const files: FileRecord[] = [];
  const versions: VersionRecord[] = [];

  for (const course of courses) {
    const courseFiles = await fileStore.byCourse(course.id);
    files.push(...courseFiles);
    for (const file of courseFiles) {
      versions.push(...(await versionStore.byFile(file.id)));
    }
  }
  const recentOpens = await recentOpenStore.all();

  const blob = await buildBackupZip(courses, files, versions, recentOpens);
  await downloadZip(blob, `moodle-archive-backup_${timestampForFilename(new Date())}.zip`);
}

/**
 * Same idea as `exportAllData`, scoped to a single course — produces a zip in the
 * same format (so `importAllData` can restore it as-is, on this browser or
 * another one, merging into an existing course with the same id or creating it
 * fresh if it's new there).
 */
export async function exportCourse(courseId: string): Promise<void> {
  const course = await courseStore.get(courseId);
  if (!course) {
    throw new Error('Course not found.');
  }

  const files = await fileStore.byCourse(courseId);
  const versions: VersionRecord[] = [];
  for (const file of files) {
    versions.push(...(await versionStore.byFile(file.id)));
  }
  const recentOpens = await recentOpenStore.byCourse(courseId);

  const blob = await buildBackupZip([course], files, versions, recentOpens);
  const filename = `moodle-archive-course_${safeFilenamePart(course.name)}_${timestampForFilename(new Date())}.zip`;
  await downloadZip(blob, filename);
}

export interface ImportSummary {
  courses: number;
  files: number;
  versions: number;
  recentOpens: number;
}

/**
 * Restores courses/files/versions/recent-opens from a zip produced by
 * `exportAllData`/`exportCourse`.
 *
 * A course's `id` is its identity — not its name, which is just an editable
 * tag ("Set tag name") — so an imported course is the *same* course as a
 * local one exactly when their ids match, however differently either one is
 * currently named. When they match, the import merges into the existing
 * record: the local tag always wins (an import can't overwrite a rename),
 * and its files are diffed by content hash — exactly like a real download —
 * so unchanged content isn't re-stored and a genuinely new/changed file
 * still gets classified as such. An id with no local match is a brand-new
 * course, using the imported name and treated as its own "first sync" (so
 * its files start as the baseline rather than all flagged "new"). Every
 * historical version from the import is restored either way, deduplicated
 * by hash against whatever that file already has.
 */
export async function importAllData(file: File | Blob): Promise<ImportSummary> {
  const zip = await JSZip.loadAsync(file);
  const manifestEntry = zip.file(MANIFEST_NAME);
  if (!manifestEntry) {
    throw new Error('Not a valid Moodle Archive backup (missing data.json).');
  }

  const manifest = JSON.parse(await manifestEntry.async('string')) as BackupManifest;
  const existingById = new Map((await courseStore.all()).map((c) => [c.id, c]));

  let importedFileCount = 0;
  let importedVersionCount = 0;

  for (const importedCourse of manifest.courses) {
    const existing = existingById.get(importedCourse.id);

    const mergedCourse: Course = existing
      ? {
          ...existing, // the local tag (name), order, hidden state, etc. all win as-is
          matchedUrls: Array.from(new Set([...existing.matchedUrls, ...importedCourse.matchedUrls])),
          url: existing.url || importedCourse.url,
          lastSyncedAt: Math.max(existing.lastSyncedAt, importedCourse.lastSyncedAt)
        }
      : { ...importedCourse, hidden: false, firstSyncCompleted: false };
    await courseStore.put(mergedCourse);

    const isFirstSync = !mergedCourse.firstSyncCompleted;
    const filesForCourse = manifest.files.filter((f) => f.courseId === importedCourse.id);
    importedFileCount += filesForCourse.length;

    for (const importedFile of filesForCourse) {
      // Ids already line up 1:1 with this browser's own — a course's id never
      // changes here, so `${courseId}::${relativePath}` is the same file id
      // whether it came from the import or was already tracked locally.
      const fileId = importedFile.id;

      const versionsForFile = manifest.versions
        .filter((v) => v.fileId === fileId)
        .sort((a, b) => a.timestamp - b.timestamp);
      if (versionsForFile.length === 0) continue;

      // The latest version goes through the same SHA-256 diff a real download
      // uses, so it's skipped entirely if the file already has this exact
      // content, or correctly flagged new/modified otherwise. (Note: on a
      // course's first sync, a genuinely new file is still written but
      // classified as "unchanged" rather than "created" — so whether a write
      // happened is determined directly, rather than from that tally.)
      const latest = versionsForFile[versionsForFile.length - 1];
      const knownHashes = new Set((await versionStore.byFile(fileId)).map((v) => v.sha256));
      const latestZipEntry = zip.file(`${CONTENT_DIR}/${latest.id}`);
      if (latestZipEntry) {
        const willWrite = !knownHashes.has(latest.sha256);
        const content = new Uint8Array(await latestZipEntry.async('arraybuffer'));
        const entry: ExtractedEntry = {
          relativePath: importedFile.relativePath,
          content,
          sha256: latest.sha256,
          size: latest.size
        };
        await processEntryBatchForCourse(importedCourse.id, [entry], latest.timestamp, isFirstSync);
        if (willWrite) importedVersionCount++;
        knownHashes.add(latest.sha256);
      }

      // Older history is restored too, deduplicated by content hash against
      // whatever the file already has (the diff above included).
      for (const meta of versionsForFile) {
        if (meta === latest || knownHashes.has(meta.sha256)) continue;
        const zipEntry = zip.file(`${CONTENT_DIR}/${meta.id}`);
        if (!zipEntry) continue; // corrupt/partial backup — skip rather than fail the whole import
        const content = new Blob([await zipEntry.async('arraybuffer')], {
          type: guessMimeType(importedFile.relativePath)
        });
        await versionStore.put({ ...meta, content });
        knownHashes.add(meta.sha256);
        importedVersionCount++;
      }
    }

    if (isFirstSync && filesForCourse.length > 0) {
      await courseStore.put({ ...mergedCourse, firstSyncCompleted: true });
    }
  }

  for (const recentOpen of manifest.recentOpens) {
    await recentOpenStore.recordOpen(recentOpen);
  }

  return {
    courses: manifest.courses.length,
    files: importedFileCount,
    versions: importedVersionCount,
    recentOpens: manifest.recentOpens.length
  };
}
