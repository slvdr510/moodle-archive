import { fileStore, versionStore } from '../lib/db';
import { downloadNameFor } from '../lib/downloadNameSettings';
import { getRenderKind } from '../lib/fileKind';
import { withCorrectType } from '../lib/openFile';
import { forgetDownloadName, rememberDownloadName } from '../lib/blobDownloadNames';
import { applyDocumentLanguage, getMessages } from '../lib/i18n';

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
  applyDocumentLanguage();
  const t = getMessages();
  const versionId = new URLSearchParams(window.location.search).get('version');
  const version = versionId ? await versionStore.get(versionId) : undefined;
  const file = version ? await fileStore.get(version.fileId) : undefined;

  if (!version || !file) {
    showMessage(t.viewer.notFoundTitle, t.viewer.notFoundText);
    return;
  }

  const { filename } = file;
  const content = withCorrectType(version.content, filename);
  document.title = filename;

  switch (getRenderKind(filename)) {
    case 'pdf': {
      const frame = document.createElement('iframe');
      frame.title = filename;
      const url = URL.createObjectURL(content);
      // So the PDF viewer's own download button saves under `filename`, not the
      // blob's UUID — see blobDownloadNames.ts. Best effort: the PDF shows either way.
      await downloadNameFor(file.courseId, filename)
        .then((name) => rememberDownloadName(url, name))
        .catch((err: unknown) => console.error(err));
      window.addEventListener('pagehide', () => void forgetDownloadName(url).catch(() => {}));
      frame.src = url;
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
      showMessage(filename, t.viewer.cannotPreview);
  }
}

void main();
