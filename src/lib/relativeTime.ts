const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * A compact "time ago" label (e.g. "3d ago", "1w ago") that intentionally never
 * shows seconds — the caller doesn't want to re-render this on a timer, and a
 * seconds-level label would look stale within moments of rendering.
 */
export function formatRelativeTime(timestampMs: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestampMs);

  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`;
  return `${Math.floor(diff / YEAR)}y ago`;
}
