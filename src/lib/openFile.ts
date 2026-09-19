import { bytesToBase64 } from './base64';
import { getRenderKind, guessMimeType } from './fileKind';

// Above this size, inlining an image as a data: URI (see below) gets too big to be
// a good idea — fall back to a plain download instead. Doesn't apply to PDFs, which
// are opened via a cheap blob: URL rather than a base64-encoded data: URI.
export const MAX_INLINE_BYTES = 25 * 1024 * 1024;

/**
 * Whether this file's kind is shown inline, in our own viewer tab or (for PDFs) by
 * navigating straight to it, rather than being downloaded and handed to the OS's
 * default app.
 */
export function canPreviewInline(filename: string): boolean {
  const kind = getRenderKind(filename);
  return kind === 'image' || kind === 'text' || kind === 'pdf';
}

/**
 * A version's `content` gets its Blob `type` set once, when that version is first
 * captured (see repository.ts) — a version already sitting in IndexedDB from before
 * that was correctly wired up (or from any other bug in that logic) would silently
 * keep an empty/wrong type forever, since nothing rewrites it after the fact. Every
 * viewing path below needs a *correct* type to work at all (an untyped blob: URL
 * doesn't render as a PDF/image, it just doesn't render), so re-derive it from the
 * filename at the point of use instead of trusting whatever was stored.
 */
function withCorrectType(content: Blob, filename: string): Blob {
  const correctType = guessMimeType(filename);
  return content.type === correctType ? content : new Blob([content], { type: correctType });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return `data:${blob.type || 'application/octet-stream'};base64,${bytesToBase64(bytes)}`;
}

const VIEWER_STYLES = `
  :root { color-scheme: light dark; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1115; color: #e5e7eb; }
  header { padding: 10px 16px; background: #1a1d23; border-bottom: 1px solid #2a2d34; font-size: 13px; word-break: break-all; }
  main { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 41px); }
  img { max-width: 100%; max-height: calc(100vh - 41px); }
  pre { width: 100%; height: calc(100vh - 41px); margin: 0; padding: 16px; box-sizing: border-box; white-space: pre-wrap; word-break: break-word; overflow: auto; font-size: 13px; }
`;

/**
 * Builds a small standalone HTML page (opened as its own blob: tab) that shows the
 * filename and the actual content — a bare `window.open(blobUrl)` on the file's own
 * blob had no Content-Type and no title, so the tab was just a blank/garbled page.
 * Only for images and text: content is inlined as a data: URI rather than referenced
 * via a second, separate `blob:` URL, since a blob URL created in the dashboard tab
 * is not reliably resolvable from inside a *different* tab's document. html/htm
 * content is shown as escaped text rather than executed, since this page runs under
 * the extension's own origin.
 */
async function buildViewerDocument(content: Blob, filename: string): Promise<string> {
  const kind = getRenderKind(filename);
  const safeName = escapeHtml(filename);

  let bodyHtml: string;
  if (kind === 'text') {
    const text = await content.text();
    bodyHtml = `<pre>${escapeHtml(text)}</pre>`;
  } else {
    const dataUrl = await blobToDataUrl(content);
    bodyHtml = `<img src="${dataUrl}" alt="${safeName}">`;
  }

  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${safeName}</title>` +
    `<style>${VIEWER_STYLES}</style></head><body><header>${safeName}</header>` +
    `<main>${bodyHtml}</main></body></html>`
  );
}

/** Saves a version's content to the browser's default Downloads folder under `filename`. */
async function saveToDownloads(content: Blob, filename: string): Promise<number> {
  const url = URL.createObjectURL(content);
  try {
    return await chrome.downloads.download({ url, filename });
  } finally {
    // chrome.downloads.download reads the blob asynchronously in the background;
    // give it plenty of time to finish before freeing the underlying data.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

/**
 * `chrome.downloads.download()` resolves as soon as the download *starts*, not
 * once it's finished writing to disk — calling `chrome.downloads.open()` right
 * after can fail with "not complete" for anything but the smallest files. This
 * waits for the download to actually reach a final state first.
 */
function waitForDownloadComplete(downloadId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    function finish(action: () => void): void {
      if (settled) return;
      settled = true;
      chrome.downloads.onChanged.removeListener(onChanged);
      action();
    }

    function onChanged(delta: chrome.downloads.DownloadDelta): void {
      if (delta.id !== downloadId || !delta.state) return;
      if (delta.state.current === 'complete') finish(resolve);
      else if (delta.state.current === 'interrupted') finish(() => reject(new Error('The download was interrupted.')));
    }

    chrome.downloads.onChanged.addListener(onChanged);

    // It may already be complete (small/instant downloads) by the time we get here.
    chrome.downloads.search({ id: downloadId }, ([item]) => {
      if (!item) return;
      if (item.state === 'complete') finish(resolve);
      else if (item.state === 'interrupted') finish(() => reject(new Error('The download was interrupted.')));
    });
  });
}

/**
 * Downloads a specific version straight to the browser's default Downloads
 * folder, under its real filename — no viewer tab, no auto-open. This is the
 * explicit "save a copy of this file" action, independent of "open"/"view".
 */
export async function downloadVersion(content: Blob, filename: string): Promise<void> {
  await saveToDownloads(withCorrectType(content, filename), filename);
}

async function downloadAndOpenNatively(content: Blob, filename: string): Promise<void> {
  const downloadId = await saveToDownloads(content, filename);
  try {
    await waitForDownloadComplete(downloadId);
    await chrome.downloads.open(downloadId);
  } catch (err) {
    // Auto-opening can still fail even once the download is complete — it needs
    // an unbroken user-gesture chain, and depends on the OS having a default app
    // registered for this file type. The file is still downloaded either way;
    // surface why the auto-open step itself didn't work, rather than silently
    // pretending nothing happened.
    console.error('Could not automatically open the downloaded file:', err);
    window.alert(
      `Downloaded "${filename}", but couldn't open it automatically ` +
        `(${String(err)}).\n\nYou can open it from Chrome's downloads (Ctrl+J / Cmd+Shift+J). ` +
        'Tip: right-click a download there and choose "Always open files of this type" so this ' +
        'happens automatically from now on.'
    );
  }
}

/**
 * Opens a specific version. Images and text open in our own viewer tab (filename
 * header + rendered content). PDFs open by navigating a new tab directly to the
 * file's own blob: URL — Chrome's built-in PDF viewer takes over from there; this
 * is exactly how the pre-merge version of this extension did it (reading a real
 * `File` off disk via the File System Access API always got a correctly-typed
 * blob for free, which is what made it "just work" there). Everything else —
 * video, audio, office documents, oversized images, ... — is downloaded under its
 * real filename and handed to the OS's default app, like clicking "open" on a
 * completed Chrome download.
 */
export async function openVersionInBrowser(rawContent: Blob, filename: string): Promise<void> {
  const content = withCorrectType(rawContent, filename);
  const kind = getRenderKind(filename);

  if (kind === 'pdf') {
    const url = URL.createObjectURL(content);
    window.open(url, '_blank');
    // Give Chrome's PDF viewer plenty of time to actually fetch and render it
    // before the underlying data is freed.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  const tooLargeToInline = kind !== 'text' && content.size > MAX_INLINE_BYTES;

  if ((kind === 'image' || kind === 'text') && !tooLargeToInline) {
    const html = await buildViewerDocument(content, filename);
    const viewerUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(viewerUrl, '_blank');
    return;
  }

  await downloadAndOpenNatively(content, filename);
}
