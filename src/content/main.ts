import { DownloadCancelledError, crawlCourse, type CrawledEntry } from './moodleCrawler';
import { message } from './message';
import { loadMessages, type Messages } from '../lib/i18n';

export type Status = 'initialized' | 'processing' | 'finished';

export interface CourseSnapshotChunkMessage {
  topic: 'course-snapshot-chunk';
  payload: {
    courseUrl: string;
    courseTitle: string;
    /** `content` is base64-encoded — see ../lib/base64.ts for why. */
    entries: { relativePath: string; content: string }[];
    timestampMs: number;
    chunkIndex: number;
    totalChunks: number;
    allRelativePaths: string[];
  };
}

type SnapshotResponse = { ok: boolean; error?: string } | undefined;

// A large course (100+ files) sent as one single message used to make the
// background take so long processing it synchronously that Chrome could kill the
// service worker mid-request, silently dropping the response and leaving the
// popup stuck on "Saving..." forever. Splitting into chunks (below) fixes the
// underlying cause; this timeout is a second line of defense so any other stall
// still surfaces an error instead of hanging indefinitely.
const SAVE_TIMEOUT_MS = 120_000;

// Caps each chunk's total base64 size (not file count) so one message stays small
// even if a course happens to have a few huge files rather than many small ones.
const MAX_CHUNK_BASE64_CHARS = 4_000_000;

function chunkEntries(entries: CrawledEntry[]): CrawledEntry[][] {
  const chunks: CrawledEntry[][] = [];
  let current: CrawledEntry[] = [];
  let currentSize = 0;

  for (const entry of entries) {
    if (current.length > 0 && currentSize + entry.content.length > MAX_CHUNK_BASE64_CHARS) {
      chunks.push(current);
      current = [];
      currentSize = 0;
    }
    current.push(entry);
    currentSize += entry.content.length;
  }
  if (current.length > 0) chunks.push(current);

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

async function saveSnapshot(
  courseUrl: string,
  courseTitle: string,
  entries: CrawledEntry[],
  t: Messages
): Promise<string | undefined> {
  const chunks = chunkEntries(entries);
  const allRelativePaths = entries.map((e) => e.relativePath);
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
        entries: chunk,
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

  const result = await crawlCourse(window.location.href, t);
  if (result && result.entries.length > 0) {
    message<string>('status-log', t.download.saving);
    const failure = await saveSnapshot(result.courseUrl, result.courseTitle, result.entries, t);
    message<string>('status-log', failure ? t.download.saveFailed(failure) : t.download.saved);
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
      if (error instanceof DownloadCancelledError) {
        message<string>('status-log', error.message);
      } else {
        console.error('The download failed:', error);
        const t = await loadMessages();
        message<string>('status-log', t.download.saveFailed(String(error)));
      }
      message<Status>('status', 'finished');
    })
    .finally(() => {
      globalThis.moodleArchiveDownloading = false;
    });
}
