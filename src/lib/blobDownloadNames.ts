/**
 * Every download this extension makes is of a `blob:` URL, and Chrome names such a
 * download after the URL's last segment — the blob's random UUID. Two cases need
 * the real name put back:
 *
 * - The viewer page shows a PDF through a blob URL, and Chrome's built-in PDF
 *   viewer's download button has no other name to go on.
 * - `chrome.downloads.download({ filename })` — once *any* `onDeterminingFilename`
 *   listener exists (ours below, or another extension's), Chromium drops that
 *   `filename` unless a listener suggests it again. So `downloadBlobUrl` records it
 *   here too, rather than relying on the option alone.
 *
 * Each blob URL's filename is recorded here, and the background's
 * `onDeterminingFilename` listener (which may run in a freshly woken service worker,
 * hence session storage rather than memory) suggests it back.
 */

const KEY_PREFIX = 'viewerDownloadName:';

function keyFor(blobUrl: string): string {
  return KEY_PREFIX + blobUrl;
}

export async function rememberDownloadName(blobUrl: string, filename: string): Promise<void> {
  await chrome.storage.session.set({ [keyFor(blobUrl)]: filename });
}

export async function forgetDownloadName(blobUrl: string): Promise<void> {
  await chrome.storage.session.remove(keyFor(blobUrl));
}

/** The filename recorded for a download of `url`, if it's one of the viewer's blob URLs. */
export async function lookUpDownloadName(url: string): Promise<string | undefined> {
  if (!url.startsWith('blob:')) return undefined;
  const key = keyFor(url.split('#')[0]);
  const stored = await chrome.storage.session.get(key);
  return stored[key] as string | undefined;
}

/**
 * Downloads `blobUrl` under `filename`, revoking the URL a minute later —
 * `chrome.downloads.download` reads the blob asynchronously in the background, so
 * it's given plenty of time to finish before the underlying data is freed.
 */
export async function downloadBlobUrl(blobUrl: string, filename: string): Promise<number> {
  await rememberDownloadName(blobUrl, filename).catch((err: unknown) => console.error(err));
  try {
    return await chrome.downloads.download({ url: blobUrl, filename });
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      void forgetDownloadName(blobUrl).catch(() => {});
    }, 60_000);
  }
}

/**
 * Registers the listener that renames downloads of the extension's own blob URLs. Must be
 * called at the background script's top level so Chrome wakes it for downloads.
 */
export function installDownloadNaming(): void {
  chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    lookUpDownloadName(item.finalUrl || item.url)
      .then((filename) => (filename ? suggest({ filename, conflictAction: 'uniquify' }) : suggest()))
      .catch(() => suggest());
    // Tells Chrome `suggest` will be called asynchronously.
    return true;
  });
}
