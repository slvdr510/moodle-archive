// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, getStoredDateFormat, setStoredDateFormat } from '../src/lib/dateFormat';

afterEach(() => {
  localStorage.clear();
});

const TIMESTAMP = new Date(2026, 2, 7, 14, 5, 0).getTime(); // 2026-03-07 14:05

describe('formatDate', () => {
  it('defaults to day/month/year when nothing is stored', () => {
    expect(getStoredDateFormat()).toBe('dmy');
    expect(formatDate(TIMESTAMP)).toBe('07/03/2026');
  });

  it('formats as day/month/year', () => {
    expect(formatDate(TIMESTAMP, 'dmy')).toBe('07/03/2026');
  });

  it('formats as month/day/year', () => {
    expect(formatDate(TIMESTAMP, 'mdy')).toBe('03/07/2026');
  });

  it('formats as year/month/day', () => {
    expect(formatDate(TIMESTAMP, 'ymd')).toBe('2026/03/07');
  });

  it('persists the chosen preference and falls back to the default for garbage values', () => {
    setStoredDateFormat('ymd');
    expect(getStoredDateFormat()).toBe('ymd');

    localStorage.setItem('moodle-archive-date-format', 'not-a-real-format');
    expect(getStoredDateFormat()).toBe('dmy');
  });

  it('notifies subscribers when the preference changes', async () => {
    const { subscribeDateFormat } = await import('../src/lib/dateFormat');
    let calls = 0;
    const unsubscribe = subscribeDateFormat(() => calls++);

    setStoredDateFormat('dmy');
    expect(calls).toBe(1);

    unsubscribe();
    setStoredDateFormat('mdy');
    expect(calls).toBe(1);
  });
});

describe('formatDateTime', () => {
  it('appends a short time after the formatted date', () => {
    const result = formatDateTime(TIMESTAMP, 'ymd');
    expect(result.startsWith('2026/03/07 ')).toBe(true);
  });
});
