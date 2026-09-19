import { fileStore, versionStore } from './db';
import { guessMimeType } from './fileKind';
import type { ExtractedEntry, FileRecord, FileStatus, VersionRecord } from '../types';

export interface ProcessCourseResult {
  created: number;
  modified: number;
  deleted: number;
  unchanged: number;
}

function fileId(courseId: string, relativePath: string): string {
  return `${courseId}::${relativePath}`;
}

/**
 * Classifies and stores a batch of freshly crawled entries against what's already
 * known for the course — new/changed content becomes a `VersionRecord` (kept
 * directly as a Blob in IndexedDB — no disk, no folder permissions). Deliberately
 * doesn't look at deletions: classifying one entry only needs that entry's own
 * history, so a course's entries can be split into several smaller batches (to keep
 * any one message to the background small) without changing the outcome — as long
 * as `markDeletedForCourse` still runs once, after every batch has been processed.
 *
 * `isFirstSync` (default false) marks every brand-new file as 'unchanged' instead
 * of 'new' — on a course's very first download, literally every file is "new",
 * which isn't useful information; it's the baseline everything else gets compared
 * against from the second download onward.
 */
export async function processEntryBatchForCourse(
  courseId: string,
  entries: ExtractedEntry[],
  timestampMs: number,
  isFirstSync = false
): Promise<ProcessCourseResult> {
  const result: ProcessCourseResult = { created: 0, modified: 0, deleted: 0, unchanged: 0 };

  for (const entry of entries) {
    const id = fileId(courseId, entry.relativePath);
    const existing = await fileStore.get(id);
    const latestSha256 = existing ? (await versionStore.byFile(id)).at(-1)?.sha256 : undefined;

    if (latestSha256 === entry.sha256) {
      if (existing && existing.currentStatus !== 'unchanged') {
        await fileStore.put({ ...existing, currentStatus: 'unchanged', deletedAt: undefined });
      }
      result.unchanged++;
      continue;
    }

    const status: FileStatus = existing ? 'modified' : isFirstSync ? 'unchanged' : 'new';
    const fileRecord: FileRecord = {
      id,
      courseId,
      relativePath: entry.relativePath,
      filename: entry.relativePath.split('/').pop()!,
      currentStatus: status
    };
    await fileStore.put(fileRecord);

    const versionRecord: VersionRecord = {
      id: `${id}::${entry.sha256}`,
      fileId: id,
      sha256: entry.sha256,
      size: entry.size,
      timestamp: timestampMs,
      content: new Blob([entry.content as BufferSource], { type: guessMimeType(entry.relativePath) })
    };
    await versionStore.put(versionRecord);

    if (status === 'new') result.created++;
    else if (status === 'modified') result.modified++;
    else result.unchanged++;
  }

  return result;
}

/**
 * Marks every currently-tracked file of the course that isn't in
 * `presentRelativePaths` as deleted — call once per snapshot, after every batch of
 * that snapshot's entries has gone through `processEntryBatchForCourse`.
 */
export async function markDeletedForCourse(
  courseId: string,
  presentRelativePaths: Iterable<string>,
  timestampMs: number
): Promise<number> {
  const present = new Set(presentRelativePaths);
  const existingFiles = await fileStore.byCourse(courseId);
  let deletedCount = 0;

  for (const file of existingFiles) {
    if (file.currentStatus !== 'deleted' && !present.has(file.relativePath)) {
      await fileStore.put({ ...file, currentStatus: 'deleted', deletedAt: timestampMs });
      deletedCount++;
    }
  }

  return deletedCount;
}

/** Convenience one-shot version of the above, for when a snapshot's entries all
 *  fit comfortably in a single batch (e.g. in tests, or restoring a backup). */
export async function processEntriesForCourse(
  courseId: string,
  entries: ExtractedEntry[],
  timestampMs: number,
  isFirstSync = false
): Promise<ProcessCourseResult> {
  const result = await processEntryBatchForCourse(courseId, entries, timestampMs, isFirstSync);
  result.deleted = await markDeletedForCourse(
    courseId,
    entries.map((e) => e.relativePath),
    timestampMs
  );
  return result;
}
