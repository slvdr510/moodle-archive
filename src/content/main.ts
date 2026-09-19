import { crawlCourse, type CrawledEntry } from './moodleCrawler';
import { message } from './message';

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

function sendMessageWithTimeout(msg: unknown): Promise<SnapshotResponse> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ ok: false, error: 'timed out waiting for a response — try again' });
    }, SAVE_TIMEOUT_MS);

    chrome.runtime.sendMessage(msg, (response: SnapshotResponse) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(chrome.runtime.lastError ? { ok: false, error: chrome.runtime.lastError.message } : response);
    });
  });
}

async function saveSnapshot(courseUrl: string, courseTitle: string, entries: CrawledEntry[]): Promise<string | undefined> {
  const chunks = chunkEntries(entries);
  const allRelativePaths = entries.map((e) => e.relativePath);
  const timestampMs = Date.now();

  for (const [chunkIndex, chunk] of chunks.entries()) {
    if (chunks.length > 1) {
      message<string>('status-log', `Saving to history... (${chunkIndex + 1}/${chunks.length})`);
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

    const response = await sendMessageWithTimeout(chunkMessage);
    if (!response?.ok) {
      return response?.error ?? 'unknown error';
    }
  }

  return undefined;
}

async function main(): Promise<void> {
  message<Status>('status', 'processing');

  const result = await crawlCourse(window.location.href);
  if (result && result.entries.length > 0) {
    message<string>('status-log', 'Saving to history...');
    const failure = await saveSnapshot(result.courseUrl, result.courseTitle, result.entries);
    message<string>('status-log', failure ? `Could not save to history: ${failure}` : 'Saved to history.');
    message<Status>('status', 'finished');
    return;
  }

  // Nothing was found to download — most likely the active tab isn't a
  // supported Moodle page. Let the popup know so it can nudge the user.
  message('no-download', undefined);
  message<Status>('status', 'finished');
}

main();
