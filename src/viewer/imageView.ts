/** Where the image sits in its viewport: its top-left corner (`x`, `y`) and scale. */
export interface ImageView {
  x: number;
  y: number;
  scale: number;
}

/** The image's natural size and the viewport it's shown in. */
export interface ImageSizes {
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

/** The furthest zoom in, as a multiple of actual size. */
export const MAX_SCALE = 8;

/** The scale that fits the whole image in the viewport — never enlarged past actual
 *  size. It's also the furthest zoom out: any smaller would just add empty space. */
export function fitScale({ imageWidth, imageHeight, viewportWidth, viewportHeight }: ImageSizes): number {
  return Math.min(1, viewportWidth / imageWidth, viewportHeight / imageHeight);
}

/** Keeps the image from leaving the viewport: along each axis, an image smaller than
 *  the viewport is centered, and a larger one can't be moved past its own edges. */
export function clampView(view: ImageView, sizes: ImageSizes): ImageView {
  const scale = Math.min(MAX_SCALE, Math.max(fitScale(sizes), view.scale));
  const clampAxis = (position: number, imageLength: number, viewportLength: number): number => {
    const length = imageLength * scale;
    if (length <= viewportLength) return (viewportLength - length) / 2;
    return Math.min(0, Math.max(viewportLength - length, position));
  };
  return {
    x: clampAxis(view.x, sizes.imageWidth, sizes.viewportWidth),
    y: clampAxis(view.y, sizes.imageHeight, sizes.viewportHeight),
    scale
  };
}

/** The whole image, as large as fits, centered. */
export function fitView(sizes: ImageSizes): ImageView {
  return clampView({ x: 0, y: 0, scale: fitScale(sizes) }, sizes);
}

/** The image as wide as the viewport, scrolled to its top — for a tall image that
 *  fitting the whole of it leaves too small to read. */
export function fitWidthView(sizes: ImageSizes): ImageView {
  return clampView({ x: 0, y: 0, scale: sizes.viewportWidth / sizes.imageWidth }, sizes);
}

/** The image as tall as the viewport, scrolled to its left edge — the counterpart of
 *  fitWidthView, for a wide image. */
export function fitHeightView(sizes: ImageSizes): ImageView {
  return clampView({ x: 0, y: 0, scale: sizes.viewportHeight / sizes.imageHeight }, sizes);
}

/** How an image opens: one that fits in the window at its actual size (undefined);
 *  otherwise a portrait one filling the window's height, any other its width. */
export function defaultFit(sizes: ImageSizes): 'height' | 'width' | undefined {
  const { imageWidth, imageHeight, viewportWidth, viewportHeight } = sizes;
  if (imageWidth <= viewportWidth && imageHeight <= viewportHeight) return undefined;
  return imageHeight > imageWidth ? 'height' : 'width';
}

/** The view an image opens at — what its zoom percentage counts from, as 100%. */
export function defaultView(sizes: ImageSizes): ImageView {
  const fit = defaultFit(sizes);
  if (fit === 'height') return fitHeightView(sizes);
  if (fit === 'width') return fitWidthView(sizes);
  return clampView({ x: 0, y: 0, scale: 1 }, sizes);
}

/** Scales `view` by `factor` around the viewport point (`px`, `py`), which stays put
 *  unless keeping the image in view means it can't. */
export function zoomAt(view: ImageView, factor: number, px: number, py: number, sizes: ImageSizes): ImageView {
  const scale = Math.min(MAX_SCALE, Math.max(fitScale(sizes), view.scale * factor));
  const applied = scale / view.scale;
  return clampView({ x: px - (px - view.x) * applied, y: py - (py - view.y) * applied, scale }, sizes);
}

/** Moves `view` by (`dx`, `dy`), as far as the viewport's edges allow. */
export function panBy(view: ImageView, dx: number, dy: number, sizes: ImageSizes): ImageView {
  return clampView({ ...view, x: view.x + dx, y: view.y + dy }, sizes);
}

/** The zoom levels the buttons and keyboard shortcuts step through, as percentages of
 *  the default view (which shows as 100%) — round numbers, not repeated ×1.25 steps.
 *  Those below 100% only matter when the default view doesn't show the whole image. */
const ZOOM_LEVELS = [10, 25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1600, 2000];

/** The next zoom level from `percent` in `direction` (1 = in, -1 = out), past the
 *  table's end continuing by doubling. Undefined when there's none further out. */
export function nextZoomLevel(percent: number, direction: 1 | -1): number | undefined {
  // Rounding slack, so 100.0000001% steps on to 125%, not back onto 100%.
  const epsilon = 0.5;
  if (direction === 1) {
    const level = ZOOM_LEVELS.find((candidate) => candidate > percent + epsilon);
    if (level) return level;
    let doubled = ZOOM_LEVELS.at(-1)!;
    while (doubled <= percent + epsilon) doubled *= 2;
    return doubled;
  }
  if (percent > ZOOM_LEVELS.at(-1)! + epsilon) {
    let level = ZOOM_LEVELS.at(-1)!;
    while (level * 2 < percent - epsilon) level *= 2;
    return level;
  }
  return [...ZOOM_LEVELS].reverse().find((candidate) => candidate < percent - epsilon);
}
