/** A course card's full size and the space between cards, in px. Cards are all the
 *  same size, and only ever shrink from this (keeping its proportions) — when that's
 *  what it takes for every card to fit on the screen, with no scrolling. */
export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 190;
export const CARD_GAP = 14;

/** The cards' layout: how many go on each row, top to bottom, and their size. */
export interface CardGrid {
  rows: number[];
  width: number;
  height: number;
}

/** `count` cards in `columns` columns, spread evenly over the rows they need — the
 *  rows that get one more being the top ones (5 in 3 columns → 3 + 2). */
export function rowsFor(count: number, columns: number): number[] {
  if (count <= 0) return [];
  const rows = Math.ceil(count / Math.max(1, columns));
  const base = Math.floor(count / rows);
  const extra = count % rows;
  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));
}

/** Below this share of their full size, cards would be too small to read: the
 *  squarest layout gives way to whichever one leaves them largest. */
export const MIN_CARD_SCALE = 0.4;

/** How large (as a share of their full size, at most 1) `count` cards can be in
 *  `columns` columns, within `width` × `height` px — each row also taking a CARD_GAP
 *  below it. */
function scaleFor(count: number, columns: number, width: number, height: number): number {
  const rows = Math.ceil(count / columns);
  const fitWidth = (width - CARD_GAP * (columns - 1)) / columns / CARD_WIDTH;
  const fitHeight = (height - CARD_GAP * rows) / rows / CARD_HEIGHT;
  return Math.max(0, Math.min(1, fitWidth, fitHeight));
}

/**
 * How `count` cards are laid out in `width` × `height` px (the room for the list), so
 * every one of them fits, with no scrolling: as close to a square as possible — √count
 * columns, rounded up (4 cards → 2 + 2, 5 → 3 + 2, 10 → 4 + 3 + 3) — the cards shrunk
 * as far as that takes. Only if that would leave them too small to read (under
 * MIN_CARD_SCALE) does it go for whichever number of columns leaves them largest.
 */
export function fitCardGrid(count: number, width: number, height: number): CardGrid {
  if (count <= 0) return { rows: [], width: CARD_WIDTH, height: CARD_HEIGHT };
  let columns = Math.ceil(Math.sqrt(count));
  let scale = scaleFor(count, columns, width, height);

  if (scale < MIN_CARD_SCALE) {
    for (let candidate = 1; candidate <= count; candidate++) {
      const candidateScale = scaleFor(count, candidate, width, height);
      if (candidateScale > scale + 1e-6) {
        columns = candidate;
        scale = candidateScale;
      }
    }
  }

  return {
    rows: rowsFor(count, columns),
    width: Math.floor(CARD_WIDTH * scale),
    height: Math.floor(CARD_HEIGHT * scale)
  };
}
