/**
 * How many of a course's files come down at once. One at a time left the connection
 * idle between files (each one's request, Moodle's redirect, the wait for its headers)
 * and let one slow transfer set the pace for the whole course; many more weigh on the
 * Moodle server for little gain. Chrome opens at most 6 connections to a server: up to
 * MAX_CONCURRENT_DOWNLOADS leaves room for asking for the next file, and for browsing
 * Moodle meanwhile.
 *
 * Stored in chrome.storage, the only place the content script (which runs with the
 * Moodle page's localStorage) can read it from.
 */
const STORAGE_KEY = 'moodle-archive-concurrent-downloads';

export const DEFAULT_CONCURRENT_DOWNLOADS = 2;
export const MAX_CONCURRENT_DOWNLOADS = 4;

function isValid(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_CONCURRENT_DOWNLOADS;
}

export async function getConcurrentDownloads(): Promise<number> {
  try {
    const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
    return isValid(stored) ? stored : DEFAULT_CONCURRENT_DOWNLOADS;
  } catch {
    return DEFAULT_CONCURRENT_DOWNLOADS;
  }
}

export async function setConcurrentDownloads(count: number): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: isValid(count) ? count : DEFAULT_CONCURRENT_DOWNLOADS });
}
