// Moving around the dashboard with just the arrow keys, Enter, the space bar and
// Escape — see useCourseGridKeys, useFileListKeys and useDialogKeys. What has the
// focus is shown as if under the pointer (see the :focus-visible rules in styles.css).

export type Arrow = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/** Whether a menu of options (.dropdown-menu, see MenuPopup) is open: it takes the keys. */
export function menuOpen(): boolean {
  return document.querySelector('.dropdown-menu') !== null;
}

export function isArrow(key: string): key is Arrow {
  return key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight';
}

/** A key pressed with Ctrl, Alt, ⌘ or Shift: a shortcut, not a move. */
export function withModifier(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;
}

export function isRtl(el: Element): boolean {
  return getComputedStyle(el).direction === 'rtl';
}

/** Moving around with the keyboard now: the lists ignore the pointer until the mouse
 *  moves (see useKeyboardMode). */
export function enterKeyboardMode(): void {
  document.documentElement.dataset.keyboardNav = '';
}

/** Focuses `el`, scrolling it into view only as far as it takes. */
export function focusItem(el: HTMLElement): void {
  enterKeyboardMode();
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function middleX(rect: DOMRect): number {
  return (rect.left + rect.right) / 2;
}

function middleY(rect: DOMRect): number {
  return (rect.top + rect.bottom) / 2;
}

function closest<T>(items: T[], distance: (item: T) => number): T {
  return items.reduce((best, item) => (distance(item) < distance(best) ? item : best));
}

function overlapsVertically(a: DOMRect, b: DOMRect): boolean {
  return a.top < b.bottom && a.bottom > b.top;
}

/**
 * Where an arrow key goes from `current`, one of `items` (in reading order), if
 * anywhere. Left and right go to the item before or after it — mirrored in a
 * right-to-left language — which past the end of a row is the first of the next one.
 * Up and down go to the nearest row above or below it, to the item there closest
 * across. Rows of different lengths, centered, put an item of one right between two
 * of the other: of those, the one toward the side of its own row it's on.
 */
export function neighbor(items: HTMLElement[], current: HTMLElement, key: Arrow): HTMLElement | undefined {
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const forward = (key === 'ArrowRight') !== isRtl(current);
    const index = items.indexOf(current);
    return index === -1 ? undefined : items[index + (forward ? 1 : -1)];
  }

  const from = current.getBoundingClientRect();
  const down = key === 'ArrowDown';
  const placed = items.map((el) => ({ el, rect: el.getBoundingClientRect() }));
  const candidates = placed.filter(({ el, rect }) =>
    el === current ? false : down ? middleY(rect) > from.bottom : middleY(rect) < from.top
  );
  if (candidates.length === 0) return undefined;
  const nearest = closest(candidates, ({ rect }) => Math.abs(middleY(rect) - middleY(from)));
  const row = candidates.filter(({ rect }) => overlapsVertically(rect, nearest.rect));

  const ownRow = placed.filter(({ rect }) => overlapsVertically(rect, from)).map(({ rect }) => rect);
  const ownRowMiddle = (Math.min(...ownRow.map((r) => r.left)) + Math.max(...ownRow.map((r) => r.right))) / 2;
  // Which way a tie goes: right of its row's middle, rightwards; else leftwards.
  const leaning = middleX(from) > ownRowMiddle ? 1 : -1;
  const x = middleX(from);
  return row.reduce((best, item) => {
    const distance = Math.abs(middleX(item.rect) - x);
    const bestDistance = Math.abs(middleX(best.rect) - x);
    if (Math.abs(distance - bestDistance) > 0.5) return distance < bestDistance ? item : best;
    return (middleX(item.rect) - middleX(best.rect)) * leaning > 0 ? item : best;
  }).el;
}
