// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlobUrl } from '../src/lib/downloadBlob';

type CreatedListener = (item: { id: number; url: string }) => void;
let created: Set<CreatedListener>;
let clicked: Array<{ href: string; download: string }>;

beforeEach(() => {
  vi.useFakeTimers();
  created = new Set();
  clicked = [];
  vi.stubGlobal('chrome', {
    downloads: {
      onCreated: {
        addListener: (l: CreatedListener) => created.add(l),
        removeListener: (l: CreatedListener) => created.delete(l)
      }
    }
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push({ href: this.href, download: this.download });
  });
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const BLOB = 'blob:chrome-extension://abc/3c4af0c2-61fa-44b5-945c-9d1182d3472f';

const fireCreated = (item: { id: number; url: string }) => [...created].forEach((l) => l(item));

describe('downloadBlobUrl', () => {
  it("names the download through a link's download attribute, with no onDeterminingFilename listener", async () => {
    const id = downloadBlobUrl(BLOB, 'CALENDARIO_DE_PRACTICAS.pdf');

    expect(clicked).toEqual([{ href: BLOB, download: 'CALENDARIO_DE_PRACTICAS.pdf' }]);
    fireCreated({ id: 3, url: 'https://example.com/other.zip' });
    fireCreated({ id: 4, url: BLOB });
    expect(await id).toBe(4);
    expect(created.size).toBe(0);
  });

  it('revokes the blob URL a minute after the download starts', async () => {
    const id = downloadBlobUrl(BLOB, 'x.pdf');
    fireCreated({ id: 1, url: BLOB });
    await id;

    vi.advanceTimersByTime(59_000);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(BLOB);
  });

  it("fails, and stops listening, if Chrome never starts the download", async () => {
    const id = downloadBlobUrl(BLOB, 'x.pdf');
    const failed = expect(id).rejects.toThrow("didn't start");
    vi.advanceTimersByTime(30_000);
    await failed;
    expect(created.size).toBe(0);
  });
});
