import { fileStore, versionStore } from '../lib/db';
import { getRenderKind } from '../lib/fileKind';
import { withCorrectType } from '../lib/openFile';

/**
 * A file opened straight from a `blob:` URL can't survive a browser restart — the
 * blob is gone by then, so a restored window lands on "not found". This page lives
 * at a stable URL (`?version=<id>`) instead: it looks the version up again in
 * IndexedDB on every load and renders it — PDFs in an embedded viewer, images in an
 * <img>, text in a <pre> — so restoring the tab (or reloading it) just works.
 *
 * Any blob: URL made here belongs to this document and is freed by the browser when
 * the tab closes or reloads, so nothing needs revoking by hand.
 */

function showMessage(title: string, text: string): void {
  document.title = title;
  const message = document.createElement('p');
  message.textContent = text;
  document.body.append(message);
}

/** The filename header and centered content area shared by the image and text views. */
function showFramed(filename: string, content: HTMLElement): void {
  const header = document.createElement('header');
  header.textContent = filename;
  const main = document.createElement('main');
  main.append(content);
  document.body.append(header, main);
}

async function main(): Promise<void> {
  const versionId = new URLSearchParams(window.location.search).get('version');
  const version = versionId ? await versionStore.get(versionId) : undefined;
  const file = version ? await fileStore.get(version.fileId) : undefined;

  if (!version || !file) {
    showMessage('File not found', 'This file is no longer in your Moodle Archive history — it may have been deleted.');
    return;
  }

  const { filename } = file;
  const content = withCorrectType(version.content, filename);
  document.title = filename;

  switch (getRenderKind(filename)) {
    case 'pdf': {
      const frame = document.createElement('iframe');
      frame.title = filename;
      frame.src = URL.createObjectURL(content);
      document.body.append(frame);
      break;
    }
    case 'image': {
      const image = document.createElement('img');
      image.alt = filename;
      image.src = URL.createObjectURL(content);
      showFramed(filename, image);
      break;
    }
    case 'text': {
      // textContent, never innerHTML: html/htm files are shown as source, not run,
      // since this page has the extension's own origin.
      const text = document.createElement('pre');
      text.textContent = await content.text();
      showFramed(filename, text);
      break;
    }
    default:
      showMessage(filename, 'This kind of file can’t be previewed in the browser.');
  }
}

void main();
