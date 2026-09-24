import { base64ToBytes } from '../lib/base64';
import { courseStore } from '../lib/db';
import { humanizeCourseTitle, matchCourseForResource } from '../lib/courseMatcher';
import { INITIAL_DOWNLOAD_STATE, readDownloadState, writeDownloadState, type DownloadState } from '../lib/downloadState';
import { sha256 } from '../lib/hash';
import type { Status } from '../content/main';
import { markDeletedForCourse, processEntryBatchForCourse, type ProcessCourseResult } from '../lib/repository';
import type { Course, ExtractedEntry } from '../types';

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
  const existing = matchCourseForResource(courseUrl, courseTitle, courses);
  if (existing) {
    if (existing.matchedUrls.includes(courseUrl)) return existing;
    const updated: Course = { ...existing, matchedUrls: [...existing.matchedUrls, courseUrl] };
    await courseStore.put(updated);
    return updated;
  }

  const now = Date.now();
  const course: Course = {
    id: crypto.randomUUID(),
    name: humanizeCourseTitle(courseTitle),
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

// Updates are chained so two messages arriving back to back can't both read the
// same stored state and have the later write clobber the earlier one.
let stateUpdate: Promise<void> = Promise.resolve();

function updateDownloadState(update: (state: DownloadState) => DownloadState): void {
  stateUpdate = stateUpdate
    .then(async () => writeDownloadState(update(await readDownloadState())))
    .catch((error: unknown) => console.error('Could not persist download state:', error));
}

function trackDownloadState(message: unknown, sender: chrome.runtime.MessageSender): void {
  if (typeof message !== 'object' || message === null) return;
  const { topic, payload } = message as { topic?: string; payload?: unknown };

  switch (topic) {
    case 'status':
      if (payload === 'processing') {
        updateDownloadState(() => ({ ...INITIAL_DOWNLOAD_STATE, status: 'processing', tabId: sender.tab?.id }));
      } else {
        updateDownloadState((s) => ({ ...s, status: payload as Status, tabId: undefined }));
      }
      break;
    case 'status-log':
      updateDownloadState((s) => ({ ...s, statusLog: payload as string }));
      break;
    case 'downloaded':
      updateDownloadState((s) => ({ ...s, downloadCount: s.downloadCount + 1 }));
      break;
    case 'download-progress':
      updateDownloadState((s) => ({ ...s, progress: payload as DownloadState['progress'] }));
      break;
  }
}

// The content script dies with its tab or on navigation, without ever reporting
// 'finished' — which would leave the popup showing "processing" forever.
function interruptIfDownloadTab(tabId: number): void {
  updateDownloadState((s) =>
    s.status === 'processing' && s.tabId === tabId
      ? { ...s, status: 'finished', statusLog: 'Download interrupted: the tab was closed or navigated away.', tabId: undefined }
      : s
  );
}

chrome.tabs.onRemoved.addListener(interruptIfDownloadTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') interruptIfDownloadTab(tabId);
});

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  trackDownloadState(message, sender);

  if (!isCourseSnapshotChunkMessage(message)) {
    return undefined;
  }

  handleCourseSnapshotChunk(message.payload)
    .then((data) => sendResponse({ ok: true, ...data }))
    .catch((error: unknown) => sendResponse({ ok: false, error: String(error) }));

  return true;
});
