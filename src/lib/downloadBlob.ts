/**
 * Every download this extension makes is of a `blob:` URL, which Chrome would name
 * after the URL's last segment — the blob's random UUID. The real name goes on a
 * link's `download` attribute instead, which Chrome treats like a server's
 * Content-Disposition: it's the download's own suggested name, so it survives any
 * other extension's `onDeterminingFilename` listener (an empty `suggest()` keeps it).
 *
 * Neither `chrome.downloads.download({ filename })` nor a listener of our own would:
 * once any extension listens, that `filename` is dropped, and a listener can't stay
 * out of a download — even an empty `suggest()` overrides earlier-installed
 * extensions' names and raises a filename-conflict warning. So there's no listener.
 */

/** Starts a download of `url` saved as `filename`, the way a link with `download` would. */
export function clickDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

/**
 * Downloads `blobUrl` under `filename`, resolving with the download's id once Chrome
 * has created it. The URL is revoked a minute later — the download reads the blob
 * asynchronously in the background, so it's given plenty of time to finish before
 * the underlying data is freed.
 */
export function downloadBlobUrl(blobUrl: string, filename: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const settle = (action: () => void) => {
      clearTimeout(timer);
      chrome.downloads.onCreated.removeListener(onCreated);
      action();
    };
    // Blob URLs are unique, so the download with this URL is the one just started.
    const onCreated = (item: chrome.downloads.DownloadItem) => {
      if (item.url === blobUrl) settle(() => resolve(item.id));
    };
    const timer = setTimeout(() => settle(() => reject(new Error(`The download of ${filename} didn't start.`))), 30_000);
    chrome.downloads.onCreated.addListener(onCreated);
    clickDownload(blobUrl, filename);
  }).finally(() => setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000));
}
