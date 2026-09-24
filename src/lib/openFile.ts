import { getRenderKind, guessMimeType } from './fileKind';

// Above this size an image is downloaded and handed to the OS's default app instead
// of being decoded in a browser tab. Doesn't apply to PDFs or text.
export const MAX_INLINE_BYTES = 25 * 1024 * 1024;

/**
 * Whether this file's kind is shown inline, in our own viewer tab, rather than being
 * downloaded and handed to the OS's default app.
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
export function withCorrectType(content: Blob, filename: string): Blob {
  const correctType = guessMimeType(filename);
  return content.type === correctType ? content : new Blob([content], { type: correctType });
}

const VIEWER_PATH = 'src/viewer/index.html';

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
 * Opens a specific version. PDFs, images and text open in a viewer page at a stable
 * extension URL that re-reads the version from IndexedDB (see viewer/main.ts) —
 * unlike a blob: URL, that keeps working when the browser restores the tab after a
 * restart, and it leaves no blob behind in this (long-lived) dashboard document.
 * Everything else — video, audio, office documents, oversized images, ... — is
 * downloaded under its real filename and handed to the OS's default app, like
 * clicking "open" on a completed Chrome download.
 */
export async function openVersionInBrowser(rawContent: Blob, filename: string, versionId: string): Promise<void> {
  const content = withCorrectType(rawContent, filename);
  const kind = getRenderKind(filename);
  const tooLargeToInline = kind === 'image' && content.size > MAX_INLINE_BYTES;

  if (canPreviewInline(filename) && !tooLargeToInline) {
    window.open(chrome.runtime.getURL(`${VIEWER_PATH}?version=${encodeURIComponent(versionId)}`), '_blank');
    return;
  }

  await downloadAndOpenNatively(content, filename);
}
