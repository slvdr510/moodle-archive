/** How much of the screen's width is left empty on each side of the dashboard's
 *  content in a maximized window, as a percentage. */
const STORAGE_KEY = 'moodle-archive-side-margin';
/** The values the setting can take: steps of 5. */
export const SIDE_MARGIN_STEPS: readonly number[] = [0, 5, 10, 15, 20, 25];
export const MIN_SIDE_MARGIN = SIDE_MARGIN_STEPS[0];
export const MAX_SIDE_MARGIN = SIDE_MARGIN_STEPS[SIDE_MARGIN_STEPS.length - 1];
export const DEFAULT_SIDE_MARGIN = 20;
/** The range the setting allowed before it was limited to SIDE_MARGIN_STEPS; a value
 *  stored back then is moved to the nearest step rather than reset. */
const LEGACY_MAX_SIDE_MARGIN = 40;

function isValid(value: number): boolean {
  return SIDE_MARGIN_STEPS.includes(value);
}

/** The step closest to `value` (the lower one on a tie). */
export function nearestSideMarginStep(value: number): number {
  return SIDE_MARGIN_STEPS.reduce((best, step) => (Math.abs(step - value) < Math.abs(best - value) ? step : best));
}

export function getSideMargin(): number {
  const stored = Number(localStorage.getItem(STORAGE_KEY) ?? NaN);
  if (isValid(stored)) return stored;
  if (Number.isInteger(stored) && stored >= MIN_SIDE_MARGIN && stored <= LEGACY_MAX_SIDE_MARGIN) {
    return nearestSideMarginStep(stored);
  }
  return DEFAULT_SIDE_MARGIN;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function setSideMargin(percent: number): void {
  localStorage.setItem(STORAGE_KEY, String(isValid(percent) ? percent : DEFAULT_SIDE_MARGIN));
  listeners.forEach((listener) => listener());
}

export function subscribeSideMargin(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The content's CSS width: what it would be in a maximized window (the screen minus
 * both margins), so it never shrinks along with the window — a narrower window just
 * eats into the margins first, and below that the content takes the whole window.
 * `screenWidth` is in CSS px, which browser zoom shrinks just like the window, so
 * zooming scales only text and buttons, never the margins.
 */
export function contentWidth(marginPercent: number, screenWidth: number): string {
  const width = Math.round(screenWidth * (1 - (2 * marginPercent) / 100));
  return `min(100%, ${width}px)`;
}
