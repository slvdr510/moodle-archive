import { fileStore, versionStore } from '../lib/db';
import { downloadNameFor } from '../lib/downloadNameSettings';
import { getRenderKind } from '../lib/fileKind';
import { withCorrectType } from '../lib/openFile';
import { forgetDownloadName, rememberDownloadName } from '../lib/blobDownloadNames';
import { applyDocumentLanguage, ensureMessages, getMessages } from '../lib/i18n';
import type { Messages } from '../lib/locales/en';
import { clampView, defaultFit, defaultView, fitHeightView, fitScale, fitWidthView, MAX_SCALE, nextZoomLevel, panBy, zoomAt, type ImageSizes, type ImageView } from './imageView';

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

/** The filename header and centered content area shared by the image and text views.
 *  Returns the header, for a view to add its own controls to. */
function showFramed(filename: string, content: HTMLElement): HTMLElement {
  const header = document.createElement('header');
  const name = document.createElement('span');
  name.className = 'filename';
  name.textContent = filename;
  name.title = filename;
  header.append(name);
  const main = document.createElement('main');
  main.append(content);
  document.body.append(header, main);
  return header;
}

const PAN_STEP = 60;

// Drawn as SVG rather than Unicode arrows, which look different (or don't show at all)
// depending on the fonts installed.
const svgIcon = (paths: string): string =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
/** An arrow spanning top to bottom: the image as tall as the window. */
const FIT_VERTICALLY_ICON = svgIcon(
  '<path d="M4 3h16"/><path d="M4 21h16"/><path d="M12 7v10"/><path d="m9 10 3-3 3 3"/><path d="m9 14 3 3 3-3"/>'
);
/** An arrow spanning side to side: the image as wide as the window. */
const FIT_HORIZONTALLY_ICON = svgIcon(
  '<path d="M3 4v16"/><path d="M21 4v16"/><path d="M7 12h10"/><path d="m10 9-3 3 3 3"/><path d="m14 9 3 3-3 3"/>'
);

/**
 * Shows an image at its actual size if it fits in the window, else filling the
 * window's height if it's portrait and its width otherwise, then lets it be zoomed (Ctrl/⌘ + wheel, a
 * trackpad pinch, Ctrl/⌘ + plus/minus, the header's buttons) and moved (dragging, the
 * wheel, the arrow keys), never past the window's edges. The browser's own zoom would
 * scale the header along with it, so those gestures are taken over here and zoom only
 * the image. Ctrl/⌘ + 0 goes back to that starting view; the fit button (or a
 * double-click) toggles between filling the window's height and its width.
 */
function enableImagePanZoom(image: HTMLImageElement, header: HTMLElement, t: Messages): void {
  const main = image.parentElement!;
  main.classList.add('image-view');
  image.draggable = false;

  const button = (label: string, title: string, onClick: () => void): HTMLButtonElement => {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.title = title;
    element.setAttribute('aria-label', title);
    element.addEventListener('click', onClick);
    return element;
  };
  const zoomOutButton = button('−', t.viewer.zoomOut, () => zoomStep(-1));
  const zoomLevel = document.createElement('span');
  zoomLevel.className = 'zoom-level';
  const zoomInButton = button('+', t.viewer.zoomIn, () => zoomStep(1));
  const fitButton = button('', t.viewer.fitHorizontally, () => toggleFit());
  const controls = document.createElement('div');
  controls.className = 'zoom-controls';
  controls.append(zoomOutButton, zoomLevel, zoomInButton, fitButton);
  header.append(controls);

  let view: ImageView = { x: 0, y: 0, scale: 1 };
  // While fitted, a window resize refits instead of leaving the image where it was.
  let fitMode: 'height' | 'width' | undefined;

  const sizes = (): ImageSizes => ({
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    viewportWidth: main.clientWidth,
    viewportHeight: main.clientHeight
  });
  const show = (next: ImageView, mode: typeof fitMode): void => {
    view = next;
    fitMode = mode;
    image.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    const minScale = fitScale(sizes());
    zoomLevel.textContent = `${Math.round(zoomPercent())}%`;
    zoomOutButton.disabled = view.scale <= minScale + 1e-9;
    zoomInButton.disabled = view.scale >= MAX_SCALE - 1e-9;
    // The button shows what pressing it does: fit the other way once fitted vertically.
    const offersHorizontal = fitsVertically();
    const fitTitle = offersHorizontal ? t.viewer.fitHorizontally : t.viewer.fitVertically;
    fitButton.innerHTML = offersHorizontal ? FIT_HORIZONTALLY_ICON : FIT_VERTICALLY_ICON;
    fitButton.title = fitTitle;
    fitButton.setAttribute('aria-label', fitTitle);
    main.classList.toggle('pannable', view.scale > minScale + 1e-9);
  };
  const ready = (): boolean => image.naturalWidth > 0 && main.clientWidth > 0;
  const reset = (): void => {
    if (ready()) show(defaultView(sizes()), defaultFit(sizes()));
  };
  const fitsVertically = (): boolean => fitMode === 'height';
  const toggleFit = (): void => {
    if (!ready()) return;
    if (fitsVertically()) show(fitWidthView(sizes()), 'width');
    else show(fitHeightView(sizes()), 'height');
  };
  const zoom = (factor: number, clientX: number, clientY: number): void => {
    if (!ready()) return;
    const rect = main.getBoundingClientRect();
    show(zoomAt(view, factor, clientX - rect.left, clientY - rect.top, sizes()), undefined);
  };
  // Relative to the starting view, so an image always opens at 100% however large it is.
  const zoomPercent = (): number => (view.scale / defaultView(sizes()).scale) * 100;
  const zoomStep = (direction: 1 | -1): void => {
    if (!ready()) return;
    const level = nextZoomLevel(zoomPercent(), direction);
    if (level !== undefined) zoomAtCenter(level / zoomPercent());
  };
  const zoomAtCenter = (factor: number): void => {
    const rect = main.getBoundingClientRect();
    zoom(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };
  const pan = (dx: number, dy: number): void => {
    if (!ready()) return;
    const next = panBy(view, dx, dy, sizes());
    // Scrolling along a width- or height-fitted image keeps it fitted that way.
    show(next, fitMode);
  };

  image.addEventListener('load', reset);
  if (image.complete) reset();
  window.addEventListener('resize', () => {
    if (!ready()) return;
    if (fitMode === 'width') {
      // Refill the new width, staying at the same point down the image.
      const next = fitWidthView(sizes());
      show(clampView({ ...next, y: (view.y * next.scale) / view.scale }, sizes()), 'width');
    } else if (fitMode === 'height') {
      // Refill the new height, staying at the same point across the image.
      const next = fitHeightView(sizes());
      show(clampView({ ...next, x: (view.x * next.scale) / view.scale }, sizes()), 'height');
    } else {
      show(clampView(view, sizes()), undefined);
    }
  });

  // Not passive, or preventDefault couldn't stop the browser zooming the whole page.
  window.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        // A trackpad pinch arrives as a Ctrl + wheel with small deltas, a mouse wheel
        // notch as ~100: the exponential keeps both smooth and proportional.
        zoom(Math.exp(-event.deltaY * 0.002), event.clientX, event.clientY);
      } else if (event.shiftKey && event.deltaX === 0) {
        // Shift + a mouse wheel scrolls sideways, as on any page.
        pan(-event.deltaY, 0);
      } else {
        pan(-event.deltaX, -event.deltaY);
      }
    },
    { passive: false }
  );

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === '+' || event.key === '=') zoomStep(1);
      else if (event.key === '-') zoomStep(-1);
      else if (event.key === '0') reset();
      else return;
    } else if (event.key === 'ArrowLeft') pan(PAN_STEP, 0);
    else if (event.key === 'ArrowRight') pan(-PAN_STEP, 0);
    else if (event.key === 'ArrowUp') pan(0, PAN_STEP);
    else if (event.key === 'ArrowDown') pan(0, -PAN_STEP);
    else return;
    event.preventDefault();
  });

  main.addEventListener('dblclick', toggleFit);

  main.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    main.setPointerCapture(event.pointerId);
    main.classList.add('dragging');
    let lastX = event.clientX;
    let lastY = event.clientY;

    const move = (moveEvent: PointerEvent): void => {
      pan(moveEvent.clientX - lastX, moveEvent.clientY - lastY);
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
    };
    const end = (): void => {
      main.classList.remove('dragging');
      main.removeEventListener('pointermove', move);
      main.removeEventListener('pointerup', end);
      main.removeEventListener('pointercancel', end);
    };
    main.addEventListener('pointermove', move);
    main.addEventListener('pointerup', end);
    main.addEventListener('pointercancel', end);
  });
}

async function main(): Promise<void> {
  applyDocumentLanguage();
  await ensureMessages();
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
      enableImagePanZoom(image, showFramed(filename, image), t);
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
