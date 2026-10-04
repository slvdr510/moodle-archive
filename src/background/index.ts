import { base64ToBytes } from '../lib/base64';
import { courseStore } from '../lib/db';
import { migrateLegacyCourseTags } from '../lib/courseTagMigration';
import { humanizeCourseTitle, matchCourseForResource } from '../lib/courseMatcher';
import {
  downloadKey,
  finishCurrent,
  readDownloadState,
  removeFromQueue,
  requestDownload,
  startNext,
  tabGone,
  writeDownloadState,
  type DownloadRequestMessage,
  type DownloadState,
  type RequestDownloadResponse
} from '../lib/downloadState';
import { sha256 } from '../lib/hash';
import { markDeletedForCourse, processEntryBatchForCourse, type ProcessCourseResult } from '../lib/repository';
import type { Course, ExtractedEntry } from '../types';
import { installDownloadNaming } from '../lib/blobDownloadNames';
import { loadMessages } from '../lib/i18n';

interface CourseSnapshotChunkPayload {
  courseUrl: string;
  courseTitle: string;
  /** `content` is base64-encoded — see ../lib/base64.ts for why. */
  entries: { relativePath: string; content: string }[];
  timestampMs: number;
  chunkIndex: number;
  totalChunks: number;
  /** Every relativePath in the whole snapshot, not just this chunk — carried on
   *  every chunk so the last one can detect deletions without depending on chunks
   *  having arrived in order. */
  allRelativePaths: string[];
}

interface CourseSnapshotChunkMessage {
  topic: 'course-snapshot-chunk';
  payload: CourseSnapshotChunkPayload;
}

function isCourseSnapshotChunkMessage(message: unknown): message is CourseSnapshotChunkMessage {
  return typeof message === 'object' && message !== null && (message as CourseSnapshotChunkMessage).topic === 'course-snapshot-chunk';
}

async function findOrCreateCourse(courseUrl: string, courseTitle: string): Promise<Course> {
  const courses = await courseStore.all();
  const autoName = humanizeCourseTitle(courseTitle);
  const existing = matchCourseForResource(courseUrl, courseTitle, courses);
  if (existing) {
    if (existing.matchedUrls.includes(courseUrl) && existing.autoName === autoName) return existing;
    const updated: Course = {
      ...existing,
      matchedUrls: existing.matchedUrls.includes(courseUrl) ? existing.matchedUrls : [...existing.matchedUrls, courseUrl],
      autoName
    };
    await courseStore.put(updated);
    return updated;
  }

  const now = Date.now();
  const course: Course = {
    id: crypto.randomUUID(),
    name: autoName,
    autoName,
    url: courseUrl,
    matchedUrls: [courseUrl],
    createdAt: now,
    lastSyncedAt: now,
    order: now,
    firstSyncCompleted: false,
    hidden: false
  };
  await courseStore.put(course);
  return course;
}

/**
 * A course with 100+ files used to be sent to the background as one single message
 * containing every file's content at once — large enough, on a big course, to make
 * the service worker take so long processing it synchronously that Chrome could
 * kill it mid-request, silently dropping the response and leaving the popup stuck
 * on "Saving to history..." forever. The content script now splits a snapshot into
 * several smaller chunks (see content/main.ts); this handles one chunk at a time,
 * running the one-time-only deletion check after the last chunk arrives.
 */
async function handleCourseSnapshotChunk(
  payload: CourseSnapshotChunkPayload
): Promise<{ courseId: string; courseName: string; result: ProcessCourseResult }> {
  const foundOrCreated = await findOrCreateCourse(payload.courseUrl, payload.courseTitle);
  // Captured before this chunk's own write below — every chunk of the same
  // first-ever download reads this as false, since it only flips to true once,
  // after that download's very last chunk.
  const isFirstSync = !foundOrCreated.firstSyncCompleted;
  const course: Course = { ...foundOrCreated, lastSyncedAt: payload.timestampMs };
  await courseStore.put(course);

  const entries: ExtractedEntry[] = await Promise.all(
    payload.entries.map(async (raw) => {
      const content = base64ToBytes(raw.content);
      return {
        relativePath: raw.relativePath,
        content,
        sha256: await sha256(content),
        size: content.byteLength
      };
    })
  );

  const result = await processEntryBatchForCourse(course.id, entries, payload.timestampMs, isFirstSync);

  const isLastChunk = payload.chunkIndex === payload.totalChunks - 1;
  if (isLastChunk) {
    result.deleted = await markDeletedForCourse(course.id, payload.allRelativePaths, payload.timestampMs);
    if (isFirstSync) {
      await courseStore.put({ ...course, firstSyncCompleted: true });
    }
    // Let an already-open dashboard tab refresh itself; if none is listening
    // this just rejects quietly, which is fine.
    chrome.runtime.sendMessage({ topic: 'course-updated', courseId: course.id }).catch(() => {});
  }

  return { courseId: course.id, courseName: course.name, result };
}

// Every read-modify-write of the download state runs one after another, so two
// messages arriving back to back can't both read the same stored state and have
// the later write clobber the earlier one.
let stateTasks: Promise<unknown> = Promise.resolve();

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = stateTasks.then(task);
  stateTasks = run.catch((error: unknown) => console.error('Could not update the download state:', error));
  return run;
}

async function updateDownloadState(update: (state: DownloadState) => DownloadState): Promise<DownloadState> {
  const state = update(await readDownloadState());
  await writeDownloadState(state);
  return state;
}

/** Runs the downloader in a tab. Chrome only allows it while the extension has
 *  access to the tab — granted by opening the popup on it, lost if it navigates. */
async function injectDownloader(tabId: number): Promise<boolean> {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content/main.js'] });
    return true;
  } catch (error) {
    console.error('Could not run the downloader on this tab:', error);
    return false;
  }
}

/** Starts queued downloads until one actually starts or none are left. Call from
 *  inside `serialized`. */
async function startQueuedDownloads(): Promise<void> {
  for (;;) {
    const next = startNext(await readDownloadState());
    if (!next) return;
    await writeDownloadState(next.state);
    if (await injectDownloader(next.download.tabId)) return;
    const t = await loadMessages();
    await updateDownloadState((s) => finishCurrent(s, t.download.couldNotStart(next.download.title)));
  }
}

/** The popup asks for a tab's course: started now, or queued behind the running one. */
function handleDownloadRequest(tabId: number): Promise<RequestDownloadResponse> {
  return serialized(async () => {
    const tab = await chrome.tabs.get(tabId);
    const download = { tabId, key: downloadKey(tab.url ?? ''), title: tab.title || tab.url || '' };
    const before = await readDownloadState();
    const { outcome, state } = requestDownload(before, download);
    if (outcome === 'duplicate') return { ok: true, outcome };
    await writeDownloadState(state);
    if (outcome === 'queued') return { ok: true, outcome };
    if (await injectDownloader(tabId)) return { ok: true, outcome };
    // E.g. a chrome:// page, the Web Store, or a PDF viewer tab, none of which can
    // ever host a Moodle course. Nothing was running, so there's no queue to go on with.
    await writeDownloadState(before);
    return { ok: false };
  });
}

function isFromCurrentDownload(state: DownloadState, sender: chrome.runtime.MessageSender): boolean {
  return state.status === 'processing' && state.current !== undefined && state.current.tabId === sender.tab?.id;
}

/** Mirrors the running download's progress messages into the stored state. Messages
 *  from any other tab are ignored — only one download runs at a time. */
function trackDownloadState(message: unknown, sender: chrome.runtime.MessageSender): void {
  if (typeof message !== 'object' || message === null) return;
  const { topic, payload } = message as { topic?: string; payload?: unknown };

  const whenCurrent = (update: (state: DownloadState) => DownloadState) =>
    void serialized(() => updateDownloadState((s) => (isFromCurrentDownload(s, sender) ? update(s) : s)));

  switch (topic) {
    case 'status':
      if (payload === 'processing') {
        whenCurrent((s) => ({ ...s, statusLog: undefined, downloadCount: 0, progress: undefined }));
      } else if (payload === 'finished') {
        void serialized(async () => {
          await updateDownloadState((s) => (isFromCurrentDownload(s, sender) ? finishCurrent(s) : s));
          await startQueuedDownloads();
        });
      }
      break;
    case 'status-log':
      whenCurrent((s) => ({ ...s, statusLog: payload as string }));
      break;
    case 'downloaded':
      whenCurrent((s) => ({ ...s, downloadCount: s.downloadCount + 1 }));
      break;
    case 'download-progress':
      whenCurrent((s) => ({ ...s, progress: payload as DownloadState['progress'] }));
      break;
  }
}

// The content script dies with its tab or on navigation, without ever reporting
// 'finished' — which would leave the popup showing "processing" forever, and the
// queue stuck behind it. A queued tab that goes away can't be downloaded either.
function handleTabGone(tabId: number): void {
  void serialized(async () => {
    const t = await loadMessages();
    await updateDownloadState((s) => tabGone(s, tabId, t.download.interrupted));
    await startQueuedDownloads();
  });
}

function isDownloadRequestMessage(message: unknown): message is DownloadRequestMessage {
  const topic = typeof message === 'object' && message !== null ? (message as { topic?: unknown }).topic : undefined;
  return topic === 'request-download' || topic === 'remove-queued-download' || topic === 'download-result-seen';
}

/** Handles the popup's requests; returns true when `sendResponse` will be called. */
function handleDownloadRequestMessage(message: DownloadRequestMessage, sendResponse: (response: unknown) => void): boolean {
  switch (message.topic) {
    case 'request-download':
      handleDownloadRequest(message.payload.tabId)
        .then(sendResponse)
        .catch((error: unknown) => {
          console.error('Could not start the download:', error);
          sendResponse({ ok: false } satisfies RequestDownloadResponse);
        });
      return true;
    case 'remove-queued-download':
      void serialized(() => updateDownloadState((s) => removeFromQueue(s, message.payload.tabId)));
      return false;
    case 'download-result-seen':
      void serialized(() => updateDownloadState((s) => (s.status === 'finished' ? { ...s, finishedSeen: true } : s)));
      return false;
  }
}

installDownloadNaming();

// Courses tagged before tags were tracked get their tag recognized right after the
// extension updates (or on the next browser start, if that run didn't finish).
function runCourseTagMigration(): void {
  migrateLegacyCourseTags().catch((error: unknown) => console.error('Could not migrate course tags:', error));
}
chrome.runtime.onInstalled.addListener(runCourseTagMigration);
chrome.runtime.onStartup.addListener(runCourseTagMigration);

chrome.tabs.onRemoved.addListener(handleTabGone);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') handleTabGone(tabId);
});

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (isDownloadRequestMessage(message)) return handleDownloadRequestMessage(message, sendResponse);
  trackDownloadState(message, sender);

  if (!isCourseSnapshotChunkMessage(message)) {
    return undefined;
  }

  handleCourseSnapshotChunk(message.payload)
    .then((data) => sendResponse({ ok: true, ...data }))
    .catch((error: unknown) => sendResponse({ ok: false, error: String(error) }));

  return true;
});
