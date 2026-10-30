import { DownloadCancelledError, SaveFailedError, crawlCourse, type CrawledFile } from './moodleCrawler';
import { message } from './message';
import { randStr } from './util';
import { bytesToBase64 } from '../lib/base64';
import { getConcurrentDownloads } from '../lib/concurrentDownloads';
import type { Messages } from '../lib/i18n';
import type { IgnoreRules } from '../lib/ignoredFiles';
import { loadMessages } from '../lib/locales';

export type Status = 'initialized' | 'processing' | 'finished';

export interface SnapshotPieceMessage {
  topic: 'snapshot-piece';
  payload: {
    downloadId: string;
    relativePath: string;
    index: number;
    /** base64-encoded — see ../lib/base64.ts for why. */
    content: string;
  };
}

export interface CourseSnapshotChunkMessage {
  topic: 'course-snapshot-chunk';
  payload: {
    courseUrl: string;
    courseTitle: string;
    downloadId: string;
    /** This chunk's files, their content already sent piece by piece. */
    files: { relativePath: string; pieces: number }[];
    timestampMs: number;
    chunkIndex: number;
    totalChunks: number;
    allRelativePaths: string[];
  };
}

type SnapshotResponse = { ok: boolean; error?: string } | undefined;

export interface IgnoreRulesRequestMessage {
  topic: 'ignore-rules-request';
  payload: { courseUrl: string; courseTitle: string };
}

/** Which of the course's files the user ignored, so they aren't downloaded at all —
 *  none if the background can't say (it still drops them before saving, then). */
async function requestIgnoreRules(courseUrl: string, courseTitle: string): Promise<IgnoreRules | undefined> {
  const request: IgnoreRulesRequestMessage = { topic: 'ignore-rules-request', payload: { courseUrl, courseTitle } };
  try {
    return (await chrome.runtime.sendMessage(request)) as IgnoreRules | undefined;
  } catch (error) {
    console.error('Could not ask which files are ignored:', error);
    return undefined;
  }
}

// A large course (100+ files) sent as one single message used to make the
// background take so long processing it synchronously that Chrome could kill the
// service worker mid-request, silently dropping the response and leaving the
// popup stuck on "Saving..." forever. Splitting into chunks (below) fixes the
// underlying cause; this timeout is a second line of defense so any other stall
// still surfaces an error instead of hanging indefinitely.
const SAVE_TIMEOUT_MS = 120_000;

// Caps how much content each chunk saves (not its file count), so the background's
// work for one message stays short even if a course happens to have a few huge files
// rather than many small ones. A file bigger than this goes in a chunk of its own.
const MAX_CHUNK_BYTES = 16 * 1024 * 1024;

function chunkFiles(files: CrawledFile[]): CrawledFile[][] {
  const chunks: CrawledFile[][] = [];
  let current: CrawledFile[] = [];
  let currentSize = 0;

  for (const file of files) {
    if (current.length > 0 && currentSize + file.size > MAX_CHUNK_BYTES) {
      chunks.push(current);
      current = [];
      currentSize = 0;
    }
    current.push(file);
    currentSize += file.size;
  }
  // With every file ignored there's nothing to send, but still one (empty) chunk: it's
  // what records the download and checks for files gone from Moodle.
  if (current.length > 0 || chunks.length === 0) chunks.push(current);

  return chunks;
}

function sendMessageWithTimeout(msg: unknown, t: Messages): Promise<SnapshotResponse> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ ok: false, error: t.download.timedOut });
    }, SAVE_TIMEOUT_MS);

    chrome.runtime.sendMessage(msg, (response: SnapshotResponse) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(chrome.runtime.lastError ? { ok: false, error: chrome.runtime.lastError.message } : response);
    });
  });
}

/** Sends a piece of a file's content to the background, which holds it apart until the
 *  whole course is in (see stagingStore). */
async function stagePiece(downloadId: string, relativePath: string, index: number, piece: Uint8Array, t: Messages): Promise<void> {
  const pieceMessage: SnapshotPieceMessage = {
    topic: 'snapshot-piece',
    payload: { downloadId, relativePath, index, content: bytesToBase64(piece) }
  };
  const response = await sendMessageWithTimeout(pieceMessage, t);
  if (!response?.ok) throw new Error(response?.error ?? t.download.unknownError);
}

/** Drops the content sent for a download that won't be saved — or left behind by one
 *  that never got to say so (its tab closed, or the browser did). */
async function discardStaged(): Promise<void> {
  try {
    await chrome.runtime.sendMessage({ topic: 'snapshot-discard' });
  } catch (error) {
    console.error('Could not drop the files of an unsaved download:', error);
  }
}

/** Saves the files of a download whose content is all sent (see stagePiece), a chunk
 *  at a time. */
async function saveSnapshot(
  courseUrl: string,
  courseTitle: string,
  downloadId: string,
  files: CrawledFile[],
  t: Messages
): Promise<string | undefined> {
  const chunks = chunkFiles(files);
  const allRelativePaths = files.map((f) => f.relativePath);
  const timestampMs = Date.now();

  for (const [chunkIndex, chunk] of chunks.entries()) {
    if (chunks.length > 1) {
      message<string>('status-log', t.download.savingChunk(chunkIndex + 1, chunks.length));
    }

    const chunkMessage: CourseSnapshotChunkMessage = {
      topic: 'course-snapshot-chunk',
      payload: {
        courseUrl,
        courseTitle,
        downloadId,
        files: chunk.map(({ relativePath, pieces }) => ({ relativePath, pieces })),
        timestampMs,
        chunkIndex,
        totalChunks: chunks.length,
        allRelativePaths
      }
    };

    const response = await sendMessageWithTimeout(chunkMessage, t);
    if (!response?.ok) {
      return response?.error ?? t.download.unknownError;
    }
  }

  return undefined;
}

async function main(): Promise<void> {
  message<Status>('status', 'processing');
  const t = await loadMessages();
  const downloadId = randStr(16);
  await discardStaged();

  const result = await crawlCourse(window.location.href, {
    messages: t,
    askIgnoreRules: requestIgnoreRules,
    stage: (relativePath, index, piece) => stagePiece(downloadId, relativePath, index, piece, t),
    concurrentDownloads: await getConcurrentDownloads()
  });
  if (result && (result.files.length > 0 || result.ignored > 0)) {
    message<string>('status-log', t.download.saving);
    const failure = await saveSnapshot(result.courseUrl, result.courseTitle, downloadId, result.files, t);
    if (failure) await discardStaged();
    // Each on a line of its own: what was saved, then what was left out and why.
    const notes = failure
      ? [t.download.saveFailed(failure)]
      : [
          t.download.saved,
          ...(result.ignored > 0 ? [t.download.ignoredSkipped(result.ignored)] : []),
          ...(result.unavailable > 0 ? [t.download.unavailable(result.unavailable)] : [])
        ];
    message<string>('status-log', notes.join('\n'));
    message<Status>('status', 'finished');
    return;
  }

  // Nothing was found to download — most likely the active tab isn't a
  // supported Moodle page. Let the popup know so it can nudge the user.
  message('no-download', undefined);
  message<Status>('status', 'finished');
}

declare global {
  // Set while a download runs in this tab. Each injection of this script runs in the
  // same isolated world as the previous ones, so it sees the flag they left.
  var moodleArchiveDownloading: boolean | undefined;
}

// Injected a second time into a tab that's still downloading (the background only
// ever starts one download at a time, but nothing else stops a stray second
// injection), this does nothing rather than download the course twice at once.
if (!globalThis.moodleArchiveDownloading) {
  globalThis.moodleArchiveDownloading = true;
  void main()
    // An unexpected failure must still report 'finished', or the background would
    // think this download is still running and never start the queued ones.
    .catch(async (error: unknown) => {
      await discardStaged();
      if (error instanceof DownloadCancelledError) {
        message<string>('status-log', error.message);
      } else {
        console.error('The download failed:', error);
        const t = await loadMessages();
        const reason = error instanceof SaveFailedError ? error.message : String(error);
        message<string>('status-log', t.download.saveFailed(reason));
      }
      message<Status>('status', 'finished');
    })
    .finally(() => {
      globalThis.moodleArchiveDownloading = false;
    });
}
