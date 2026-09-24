// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_INLINE_BYTES, canPreviewInline, downloadVersion, openVersionInBrowser } from '../src/lib/openFile';

describe('canPreviewInline', () => {
  it('treats images, text-ish types and PDFs as previewable in-browser', () => {
    for (const name of ['photo.PNG', 'notes.txt', 'page.html', 'data.csv', 'notes.json', 'notes.pdf']) {
      expect(canPreviewInline(name)).toBe(true);
    }
  });

  it('treats video, audio, office documents and anything unrecognized as not previewable in-browser', () => {
    for (const name of ['clip.mp4', 'song.mp3', 'sheet.xls', 'doc.docx', 'slides.pptx', 'archive.zip']) {
      expect(canPreviewInline(name)).toBe(false);
    }
  });

  it('is case-insensitive on the extension', () => {
    expect(canPreviewInline('NOTES.TXT')).toBe(true);
    expect(canPreviewInline('CLIP.MP4')).toBe(false);
  });

  it('treats a file with no extension as not previewable in-browser', () => {
    expect(canPreviewInline('README')).toBe(false);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Captures every Blob handed to URL.createObjectURL, in call order. */
function stubCreateObjectURL(): Blob[] {
  const blobs: Blob[] = [];
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob);
    return `blob:fake-${blobs.length}`;
  });
  return blobs;
}

/** A Blob that reports a fake `size`, without actually allocating that many bytes. */
function fakeSizedBlob(sizeBytes: number, type: string): Blob {
  const blob = new Blob(['small-body'], { type });
  Object.defineProperty(blob, 'size', { value: sizeBytes });
  return blob;
}

/**
 * A working fake of the chrome.downloads surface used by the download+open path:
 * the download "completes" immediately, so waitForDownloadComplete resolves via
 * its `search` call without ever needing `onChanged` to actually fire.
 */
const getURL = (path: string) => `chrome-extension://test-id/${path}`;

function stubChromeDownloads(options: { downloadId?: number; state?: 'complete' | 'interrupted'; open?: ReturnType<typeof vi.fn> } = {}) {
  const downloadId = options.downloadId ?? 1;
  const download = vi.fn().mockResolvedValue(downloadId);
  const open = options.open ?? vi.fn().mockResolvedValue(undefined);
  const search = vi.fn((_query: unknown, callback: (items: Array<{ id: number; state: string }>) => void) => {
    callback([{ id: downloadId, state: options.state ?? 'complete' }]);
  });
  const onChanged = { addListener: vi.fn(), removeListener: vi.fn() };
  vi.stubGlobal('chrome', { downloads: { download, open, search, onChanged }, runtime: { getURL } });
  return { download, open, search };
}

describe('openVersionInBrowser for PDFs', () => {
  it('opens a new tab at a stable extension URL keyed by the version id — not a blob: URL, which would not survive a browser restart', async () => {
    const blobs = stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    await openVersionInBrowser(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'notes.pdf', 'version-1');

    expect(download).not.toHaveBeenCalled();
    expect(blobs).toHaveLength(0);
    expect(windowOpen).toHaveBeenCalledWith('chrome-extension://test-id/src/viewer/index.html?version=version-1', '_blank');
  });

  it('URL-encodes the version id', async () => {
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    stubChromeDownloads();

    await openVersionInBrowser(new Blob(['%PDF-1.4']), 'notes.pdf', 'a b&c');

    expect(windowOpen).toHaveBeenCalledWith('chrome-extension://test-id/src/viewer/index.html?version=a%20b%26c', '_blank');
  });

  it('does not fall back to a download even for a very large PDF', async () => {
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    const huge = fakeSizedBlob(MAX_INLINE_BYTES + 1, 'application/pdf');
    await openVersionInBrowser(huge, 'huge-manual.pdf', 'version-1');

    expect(download).not.toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledOnce();
  });
});

describe('openVersionInBrowser for images and text', () => {
  it.each([
    ['photo.png', 'image/png'],
    ['notes.txt', 'text/plain'],
    ['page.html', 'text/html']
  ])('opens %s at the stable viewer URL — no blob: URL left behind in the dashboard, no download', async (name, type) => {
    const blobs = stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    await openVersionInBrowser(new Blob(['data'], { type }), name, 'version-1');

    expect(download).not.toHaveBeenCalled();
    expect(blobs).toHaveLength(0);
    expect(windowOpen).toHaveBeenCalledWith('chrome-extension://test-id/src/viewer/index.html?version=version-1', '_blank');
  });

  it('falls back to a download when an image is too large to inline', async () => {
    stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download, open } = stubChromeDownloads();

    const huge = fakeSizedBlob(MAX_INLINE_BYTES + 1, 'image/png');
    await openVersionInBrowser(huge, 'huge-scan.png', 'version-1');

    expect(download).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(1);
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it('still opens text files in the viewer regardless of size', async () => {
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    const bigText = fakeSizedBlob(MAX_INLINE_BYTES + 1, 'text/plain');
    await openVersionInBrowser(bigText, 'notes.txt', 'version-1');

    expect(download).not.toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledOnce();
  });
});

describe('openVersionInBrowser for video, audio and other non-previewable types', () => {
  it('waits for the download to actually finish before trying to open it', async () => {
    stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    const openMock = vi.fn().mockResolvedValue(undefined);
    const downloadId = 7;
    const download = vi.fn().mockResolvedValue(downloadId);
    // Not complete when first checked — open() must wait for onChanged instead.
    const search = vi.fn((_query: unknown, callback: (items: unknown[]) => void) => {
      callback([{ id: downloadId, state: 'in_progress' }]);
    });
    const onChanged = { addListener: vi.fn(), removeListener: vi.fn() };
    vi.stubGlobal('chrome', { downloads: { download, open: openMock, search, onChanged } });

    const openPromise = openVersionInBrowser(new Blob(['data']), 'clip.mp4', 'version-1');

    await vi.waitFor(() => expect(onChanged.addListener).toHaveBeenCalled());
    expect(openMock).not.toHaveBeenCalled();

    // Now the download finishes — onChanged fires, and only then does open() run.
    const onChangedListener = onChanged.addListener.mock.calls[0][0] as (delta: unknown) => void;
    onChangedListener({ id: downloadId, state: { current: 'complete' } });
    await openPromise;

    expect(openMock).toHaveBeenCalledWith(downloadId);
  });

  it('downloads video/audio/office documents under their real filename and hands off to the default app', async () => {
    for (const [content, name] of [
      [new Blob(['data']), 'clip.mp4'],
      [new Blob(['data']), 'song.mp3'],
      [new Blob(['data']), 'slides.pptx'],
      [new Blob(['data']), 'sheet.xlsx']
    ] as const) {
      stubCreateObjectURL();
      vi.spyOn(window, 'open').mockReturnValue(null);
      const { download, open } = stubChromeDownloads();

      await openVersionInBrowser(content, name, 'version-1');

      expect(download).toHaveBeenCalledWith({ url: 'blob:fake-1', filename: name });
      expect(open).toHaveBeenCalledWith(1);
    }
  });

  it('does not throw if the automatic open is rejected (e.g. lost user-gesture) — the download still happened, and it tells the user why', async () => {
    stubCreateObjectURL();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubChromeDownloads({ open: vi.fn().mockRejectedValue(new Error('not a user gesture')) });

    await expect(openVersionInBrowser(new Blob(['data']), 'notes.xls', 'version-1')).resolves.toBeUndefined();

    expect(alert).toHaveBeenCalledOnce();
    expect(alert.mock.calls[0][0]).toContain('notes.xls');
    expect(alert.mock.calls[0][0]).toContain('not a user gesture');
  });

  it('tells the user if the download itself was interrupted, rather than trying to open a broken file', async () => {
    stubCreateObjectURL();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { open } = stubChromeDownloads({ state: 'interrupted' });

    await expect(openVersionInBrowser(new Blob(['data']), 'clip.mp4', 'version-1')).resolves.toBeUndefined();

    expect(open).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledOnce();
    expect(alert.mock.calls[0][0]).toContain('interrupted');
  });
});

describe('downloadVersion', () => {
  it('saves the file to Downloads without opening it or a viewer tab, for any file type', async () => {
    stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download, open } = stubChromeDownloads();

    await downloadVersion(new Blob(['data']), 'photo.png');

    expect(download).toHaveBeenCalledWith({ url: 'blob:fake-1', filename: 'photo.png' });
    expect(open).not.toHaveBeenCalled();
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it('corrects a stale/missing Blob type before saving it', async () => {
    const blobs = stubCreateObjectURL();
    const { download } = stubChromeDownloads();

    await downloadVersion(new Blob(['%PDF-1.4']), 'notes.pdf');

    expect(download).toHaveBeenCalledWith({ url: 'blob:fake-1', filename: 'notes.pdf' });
    expect(blobs[0].type).toBe('application/pdf');
  });
});
