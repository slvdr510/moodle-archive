import { getMessages, type Messages } from './i18n';

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
export function formatRelativeTime(timestampMs: number, now: number = Date.now(), t: Messages = getMessages()): string {
  const diff = Math.max(0, now - timestampMs);
  const r = t.relativeTime;

  if (diff < MINUTE) return r.justNow;
  if (diff < HOUR) return r.minutes(Math.floor(diff / MINUTE));
  if (diff < DAY) return r.hours(Math.floor(diff / HOUR));
  if (diff < WEEK) return r.days(Math.floor(diff / DAY));
  if (diff < MONTH) return r.weeks(Math.floor(diff / WEEK));
  if (diff < YEAR) return r.months(Math.floor(diff / MONTH));
  return r.years(Math.floor(diff / YEAR));
}
