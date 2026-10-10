import { describe, expect, it } from 'vitest';
import { CARD_GAP, CARD_HEIGHT, CARD_WIDTH, fitCardGrid, rowsFor } from '../src/lib/cardLayout';

describe('rowsFor', () => {
  it('spreads the cards evenly, the top rows taking one more', () => {
    expect(rowsFor(5, 3)).toEqual([3, 2]);
    expect(rowsFor(10, 4)).toEqual([4, 3, 3]);
    expect(rowsFor(7, 3)).toEqual([3, 2, 2]);
    expect(rowsFor(0, 3)).toEqual([]);
  });
});

describe('fitCardGrid', () => {
  it('lays cards out as close to a square as possible, full size when there is room', () => {
    for (const [count, rows] of [
      [1, [1]],
      [2, [2]],
      [3, [2, 1]],
      [4, [2, 2]],
      [5, [3, 2]],
      [10, [4, 3, 3]]
    ] as const) {
      expect(fitCardGrid(count, Infinity, Infinity)).toEqual({ rows, width: CARD_WIDTH, height: CARD_HEIGHT });
    }
  });

  it('keeps 5 cards as 3 + 2 in a small space, shrinking them to fit both ways', () => {
    // A zoomed-in page: about 590 × 500 px for the list.
    const grid = fitCardGrid(5, 590, 500);
    expect(grid.rows).toEqual([3, 2]);
    expect(3 * grid.width + 2 * CARD_GAP).toBeLessThanOrEqual(590);
    expect(2 * (grid.height + CARD_GAP)).toBeLessThanOrEqual(500);
    expect(grid.width / grid.height).toBeCloseTo(CARD_WIDTH / CARD_HEIGHT, 1);
  });

  it('shrinks to fit the height too, so nothing scrolls', () => {
    const grid = fitCardGrid(9, 2000, 300);
    expect(grid.rows).toEqual([3, 3, 3]);
    expect(3 * (grid.height + CARD_GAP)).toBeLessThanOrEqual(300);
  });

  it('only leaves the squarest layout when it would make the cards too small to read', () => {
    // Very wide and short: three rows of 3 would be tiny, one row of 9 isn't.
    const grid = fitCardGrid(9, 3000, 220);
    expect(grid.rows).toEqual([9]);
  });
});
