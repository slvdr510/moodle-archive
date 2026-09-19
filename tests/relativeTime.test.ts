import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from '../src/lib/relativeTime';

const NOW = new Date(2026, 0, 15, 12, 0, 0).getTime();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
  it('never shows seconds — anything under a minute reads as "just now"', () => {
    expect(formatRelativeTime(NOW - 45_000, NOW)).toBe('just now');
    expect(formatRelativeTime(NOW, NOW)).toBe('just now');
  });

  it('shows minutes under an hour', () => {
    expect(formatRelativeTime(NOW - 5 * MINUTE, NOW)).toBe('5m ago');
    expect(formatRelativeTime(NOW - 59 * MINUTE, NOW)).toBe('59m ago');
  });

  it('shows hours under a day', () => {
    expect(formatRelativeTime(NOW - 3 * HOUR, NOW)).toBe('3h ago');
    expect(formatRelativeTime(NOW - 23 * HOUR, NOW)).toBe('23h ago');
  });

  it('shows days under a week', () => {
    expect(formatRelativeTime(NOW - 2 * DAY, NOW)).toBe('2d ago');
  });

  it('shows weeks under a month', () => {
    expect(formatRelativeTime(NOW - 10 * DAY, NOW)).toBe('1w ago');
  });

  it('shows months under a year', () => {
    expect(formatRelativeTime(NOW - 90 * DAY, NOW)).toBe('3mo ago');
  });

  it('shows years for anything older', () => {
    expect(formatRelativeTime(NOW - 400 * DAY, NOW)).toBe('1y ago');
  });

  it('never returns a negative duration for a clock-skewed future timestamp', () => {
    expect(formatRelativeTime(NOW + 10_000, NOW)).toBe('just now');
  });
});
