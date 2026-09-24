import type { Status } from '../content/main';

export interface DownloadState {
  status: Status;
  statusLog?: string;
  downloadCount: number;
  progress?: { current: number; total: number };
  /** Tab the content script runs in — lets the background notice if it dies. */
  tabId?: number;
}

export const INITIAL_DOWNLOAD_STATE: DownloadState = { status: 'initialized', downloadCount: 0 };

// The download itself runs in a content script, so it keeps going when the popup
// closes — but the popup's own React state dies with it, and messages sent while
// it's closed are lost. The background mirrors them into session storage so a
// re-opened popup can show where things stand.
const STORAGE_KEY = 'downloadState';

export async function readDownloadState(): Promise<DownloadState> {
  const stored = await chrome.storage.session.get(STORAGE_KEY);
  return (stored[STORAGE_KEY] as DownloadState | undefined) ?? INITIAL_DOWNLOAD_STATE;
}

export async function writeDownloadState(state: DownloadState): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEY]: state });
}

/** Calls `listener` whenever the stored state changes, from any extension context. */
export function onDownloadStateChanged(listener: (state: DownloadState) => void): () => void {
  function handle(changes: Record<string, chrome.storage.StorageChange>, area: string): void {
    if (area !== 'session' || !(STORAGE_KEY in changes)) return;
    listener((changes[STORAGE_KEY].newValue as DownloadState | undefined) ?? INITIAL_DOWNLOAD_STATE);
  }
  chrome.storage.onChanged.addListener(handle);
  return () => chrome.storage.onChanged.removeListener(handle);
}
