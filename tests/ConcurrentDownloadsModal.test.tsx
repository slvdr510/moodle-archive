// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConcurrentDownloadsModal } from '../src/dashboard/components/ConcurrentDownloadsModal';
import { getConcurrentDownloads, setConcurrentDownloads } from '../src/lib/concurrentDownloads';

/** chrome.storage.local, as the content script reads it. */
let stored: Record<string, unknown>;

beforeEach(() => {
  stored = {};
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (key: string) => (key in stored ? { [key]: stored[key] } : {}),
        set: async (items: Record<string, unknown>) => void Object.assign(stored, items)
      }
    }
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('concurrentDownloads', () => {
  it('is 2 until the user picks another', async () => {
    expect(await getConcurrentDownloads()).toBe(2);
    await setConcurrentDownloads(3);
    expect(await getConcurrentDownloads()).toBe(3);
  });

  it('never goes outside 1–4, whatever was stored', async () => {
    for (const value of [0, 5, 2.5, '3', null]) {
      stored['moodle-archive-concurrent-downloads'] = value;
      expect(await getConcurrentDownloads()).toBe(2);
    }
    await setConcurrentDownloads(9);
    expect(await getConcurrentDownloads()).toBe(2);
  });

  it('is 2 where chrome.storage is out of reach', async () => {
    vi.stubGlobal('chrome', undefined);
    expect(await getConcurrentDownloads()).toBe(2);
  });
});

describe('ConcurrentDownloadsModal', () => {
  it('shows the stored count, and stores the one picked once saved', async () => {
    await setConcurrentDownloads(3);
    const onClose = vi.fn();
    render(<ConcurrentDownloadsModal onClose={onClose} />);

    expect(await screen.findByRole('radio', { name: '3' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByRole('radio').map((radio) => radio.textContent)).toEqual(['1', '2', '3', '4']);

    await userEvent.click(screen.getByRole('radio', { name: '1' }));
    expect(screen.getByRole('radio', { name: '1' })).toHaveAttribute('aria-checked', 'true');
    expect(await getConcurrentDownloads()).toBe(3);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await getConcurrentDownloads()).toBe(1);
    expect(onClose).toHaveBeenCalled();
  });

  it('leaves the count alone on cancel', async () => {
    render(<ConcurrentDownloadsModal onClose={() => {}} />);
    await userEvent.click(await screen.findByRole('radio', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(await getConcurrentDownloads()).toBe(2);
  });
});
