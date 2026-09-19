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
function stubChromeDownloads(options: { downloadId?: number; state?: 'complete' | 'interrupted'; open?: ReturnType<typeof vi.fn> } = {}) {
  const downloadId = options.downloadId ?? 1;
  const download = vi.fn().mockResolvedValue(downloadId);
  const open = options.open ?? vi.fn().mockResolvedValue(undefined);
  const search = vi.fn((_query: unknown, callback: (items: Array<{ id: number; state: string }>) => void) => {
    callback([{ id: downloadId, state: options.state ?? 'complete' }]);
  });
  const onChanged = { addListener: vi.fn(), removeListener: vi.fn() };
  vi.stubGlobal('chrome', { downloads: { download, open, search, onChanged } });
  return { download, open, search };
}

describe('openVersionInBrowser for PDFs', () => {
  it('navigates a new tab directly to the PDF as a blob: URL, without downloading or wrapping it in our own page', async () => {
    const blobs = stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    await openVersionInBrowser(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'notes.pdf');

    expect(download).not.toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledWith('blob:fake-1', '_blank');
    expect(blobs[0].type).toBe('application/pdf');
  });

  it('corrects a stale/missing Blob type before opening it — a version saved before content typing existed would otherwise silently fail to render', async () => {
    const blobs = stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    stubChromeDownloads();

    // No `type` set at all — simulates a version whose content Blob was created
    // before repository.ts started tagging it with the correct MIME type.
    const untyped = new Blob(['%PDF-1.4']);
    expect(untyped.type).toBe('');

    await openVersionInBrowser(untyped, 'notes.pdf');

    expect(blobs[0].type).toBe('application/pdf');
  });

  it('does not fall back to a download even for a very large PDF (a blob: URL is cheap regardless of size)', async () => {
    stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    const huge = fakeSizedBlob(MAX_INLINE_BYTES + 1, 'application/pdf');
    await openVersionInBrowser(huge, 'huge-manual.pdf');

    expect(download).not.toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledOnce();
  });
});

describe('openVersionInBrowser for images and text', () => {
  it('opens a viewer tab (not chrome.downloads) that shows the filename and an <img> for images', async () => {
    const blobs = stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    await openVersionInBrowser(new Blob(['fake-image-bytes'], { type: 'image/png' }), 'photo.png');

    expect(download).not.toHaveBeenCalled();
    // Exactly one blob: URL — for the viewer page itself. The image content is
    // inlined as a data: URI rather than a second, separately-referenced blob: URL
    // (see openFile.ts for why: it isn't reliably resolvable across tabs).
    expect(windowOpen).toHaveBeenCalledWith('blob:fake-1', '_blank');

    const viewerHtml = await blobs[0].text();
    expect(viewerHtml).toContain('<title>photo.png</title>');
    expect(viewerHtml).toContain('<img src="data:image/png;base64,');
  });

  it('corrects a stale/missing Blob type before rendering it inline', async () => {
    const blobs = stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    stubChromeDownloads();

    await openVersionInBrowser(new Blob(['fake-image-bytes']), 'photo.png');

    const viewerHtml = await blobs[0].text();
    expect(viewerHtml).toContain('<img src="data:image/png;base64,');
  });

  it('shows text content in a <pre>, HTML-escaped so it never executes as script', async () => {
    const blobs = stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    stubChromeDownloads();

    await openVersionInBrowser(new Blob(['<script>alert(1)</script>']), 'notes.txt');

    const viewerHtml = await blobs[0].text();
    expect(viewerHtml).toContain('<pre>');
    expect(viewerHtml).not.toContain('<script>alert(1)</script>');
    expect(viewerHtml).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('treats an .html file as escaped text too, never as live markup', async () => {
    const blobs = stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    stubChromeDownloads();

    await openVersionInBrowser(new Blob(['<b>bold</b>']), 'page.html');

    const viewerHtml = await blobs[0].text();
    expect(viewerHtml).toContain('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('escapes a filename containing HTML-sensitive characters', async () => {
    const blobs = stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    stubChromeDownloads();

    await openVersionInBrowser(new Blob(['data'], { type: 'image/png' }), '<evil>.png');

    const viewerHtml = await blobs[0].text();
    expect(viewerHtml).toContain('&lt;evil&gt;.png');
    expect(viewerHtml).not.toContain('<evil>.png');
  });

  it('falls back to a download when an image is too large to inline', async () => {
    stubCreateObjectURL();
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    const { download, open } = stubChromeDownloads();

    const huge = fakeSizedBlob(MAX_INLINE_BYTES + 1, 'image/png');
    await openVersionInBrowser(huge, 'huge-scan.png');

    expect(download).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(1);
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it('still opens text files inline regardless of size (no data: URI involved there)', async () => {
    const blobs = stubCreateObjectURL();
    vi.spyOn(window, 'open').mockReturnValue(null);
    const { download } = stubChromeDownloads();

    const bigText = fakeSizedBlob(MAX_INLINE_BYTES + 1, 'text/plain');
    await openVersionInBrowser(bigText, 'notes.txt');

    expect(download).not.toHaveBeenCalled();
    expect(await blobs[0].text()).toContain('<pre>');
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

    const openPromise = openVersionInBrowser(new Blob(['data']), 'clip.mp4');

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

      await openVersionInBrowser(content, name);

      expect(download).toHaveBeenCalledWith({ url: 'blob:fake-1', filename: name });
      expect(open).toHaveBeenCalledWith(1);
    }
  });

  it('does not throw if the automatic open is rejected (e.g. lost user-gesture) — the download still happened, and it tells the user why', async () => {
    stubCreateObjectURL();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubChromeDownloads({ open: vi.fn().mockRejectedValue(new Error('not a user gesture')) });

    await expect(openVersionInBrowser(new Blob(['data']), 'notes.xls')).resolves.toBeUndefined();

    expect(alert).toHaveBeenCalledOnce();
    expect(alert.mock.calls[0][0]).toContain('notes.xls');
    expect(alert.mock.calls[0][0]).toContain('not a user gesture');
  });

  it('tells the user if the download itself was interrupted, rather than trying to open a broken file', async () => {
    stubCreateObjectURL();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { open } = stubChromeDownloads({ state: 'interrupted' });

    await expect(openVersionInBrowser(new Blob(['data']), 'clip.mp4')).resolves.toBeUndefined();

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
