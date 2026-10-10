import type { Status } from '../content/main';
import { canonicalMoodleUrl } from './moodleUrl';

/** A course download, identified by the tab it runs in and by what it downloads. */
export interface QueuedDownload {
  tabId: number;
  /** What makes two downloads the same one — see `downloadKey`. */
  key: string;
  /** The tab's title when it was requested, to name it in the popup. */
  title: string;
}

export interface DownloadState {
  /** Of `current`: 'processing' while it runs, 'finished' once it's done. */
  status: Status;
  statusLog?: string;
  downloadCount: number;
  progress?: { current: number; total: number };
  /** The download running now, or the last one that ran. */
  current?: QueuedDownload;
  /** Downloads waiting for `current` to finish, first in line first. */
  queue: QueuedDownload[];
  /** Set once a popup has shown the finished result, so the next popup opening
   *  starts clean instead of repeating it until the next download. */
  finishedSeen?: boolean;
}

export const INITIAL_DOWNLOAD_STATE: DownloadState = { status: 'initialized', downloadCount: 0, queue: [] };

/**
 * What a download downloads: two tabs on the same course (even on different sections
 * of it) would download the same thing, so they count as one download.
 */
/** Whether `url` is a Moodle page the downloader understands (a course, a folder, a
 *  resource or a file) — the same patterns the crawler itself starts from. */
export function isDownloadableUrl(url: string): boolean {
  return canonicalMoodleUrl(url) !== undefined;
}

export function downloadKey(url: string): string {
  return canonicalMoodleUrl(url) ?? url.split('#')[0];
}

function isSameDownload(a: QueuedDownload, tabId: number, key: string): boolean {
  return a.tabId === tabId || a.key === key;
}

export type DownloadPlace = { kind: 'current' } | { kind: 'queued'; position: number } | { kind: 'none' };

/** Whether a tab's download (or the same download from another tab) is running or waiting. */
export function findDownload(state: DownloadState, tabId: number, key: string): DownloadPlace {
  if (state.status === 'processing' && state.current && isSameDownload(state.current, tabId, key)) {
    return { kind: 'current' };
  }
  const index = state.queue.findIndex((queued) => isSameDownload(queued, tabId, key));
  return index === -1 ? { kind: 'none' } : { kind: 'queued', position: index + 1 };
}

function started(state: DownloadState, download: QueuedDownload): DownloadState {
  return { status: 'processing', downloadCount: 0, current: download, queue: state.queue };
}

/**
 * A request to download: started right away if nothing is running, queued behind the
 * running one otherwise — unless the same download is already running or waiting.
 */
export function requestDownload(
  state: DownloadState,
  download: QueuedDownload
): { outcome: 'started' | 'queued' | 'duplicate'; state: DownloadState } {
  if (findDownload(state, download.tabId, download.key).kind !== 'none') return { outcome: 'duplicate', state };
  if (state.status === 'processing') return { outcome: 'queued', state: { ...state, queue: [...state.queue, download] } };
  return { outcome: 'started', state: started(state, download) };
}

/** Marks the running download as done, optionally with a closing message. */
export function finishCurrent(state: DownloadState, statusLog?: string): DownloadState {
  if (state.status !== 'processing') return state;
  return { ...state, status: 'finished', finishedSeen: false, statusLog: statusLog ?? state.statusLog, progress: undefined };
}

/** The first queued download, started — when nothing is running and one is waiting. */
export function startNext(state: DownloadState): { download: QueuedDownload; state: DownloadState } | undefined {
  if (state.status === 'processing' || state.queue.length === 0) return undefined;
  const [download, ...rest] = state.queue;
  return { download, state: started({ ...state, queue: rest }, download) };
}

export function removeFromQueue(state: DownloadState, tabId: number): DownloadState {
  return { ...state, queue: state.queue.filter((queued) => queued.tabId !== tabId) };
}

/**
 * A tab closed or navigated away: its download can't go on (the content script dies
 * with the page, without ever reporting it finished), and a queued one can't start.
 */
export function tabGone(state: DownloadState, tabId: number, interruptedLog: string): DownloadState {
  const running = state.status === 'processing' && state.current?.tabId === tabId;
  return removeFromQueue(running ? finishCurrent(state, interruptedLog) : state, tabId);
}

// The download itself runs in a content script, so it keeps going when the popup
// closes — but the popup's own React state dies with it, and messages sent while
// it's closed are lost. The background keeps the state (including the queue) in
// session storage, so a re-opened popup can show where things stand. Only the
// background writes it.
const STORAGE_KEY = 'downloadState';

export async function readDownloadState(): Promise<DownloadState> {
  const stored = (await chrome.storage.session.get(STORAGE_KEY))[STORAGE_KEY] as Partial<DownloadState> | undefined;
  // `queue` didn't exist before downloads could be queued.
  return stored ? { ...INITIAL_DOWNLOAD_STATE, ...stored, queue: stored.queue ?? [] } : INITIAL_DOWNLOAD_STATE;
}

export async function writeDownloadState(state: DownloadState): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEY]: state });
}

/** Calls `listener` whenever the stored state changes, from any extension context. */
export function onDownloadStateChanged(listener: (state: DownloadState) => void): () => void {
  function handle(changes: Record<string, chrome.storage.StorageChange>, area: string): void {
    if (area !== 'session' || !(STORAGE_KEY in changes)) return;
    const value = changes[STORAGE_KEY].newValue as Partial<DownloadState> | undefined;
    listener(value ? { ...INITIAL_DOWNLOAD_STATE, ...value, queue: value.queue ?? [] } : INITIAL_DOWNLOAD_STATE);
  }
  chrome.storage.onChanged.addListener(handle);
  return () => chrome.storage.onChanged.removeListener(handle);
}

/** Messages the popup sends the background, which runs the downloads. */
export type DownloadRequestMessage =
  | { topic: 'request-download'; payload: { tabId: number } }
  | { topic: 'remove-queued-download'; payload: { tabId: number } }
  | { topic: 'download-result-seen'; payload?: undefined };

export type RequestDownloadResponse = { ok: true; outcome: 'started' | 'queued' | 'duplicate' } | { ok: false };
