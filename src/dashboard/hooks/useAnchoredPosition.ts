import { useLayoutEffect, type RefObject } from 'react';

/**
 * Keeps `popupRef` (position: fixed) hanging from `anchorRef` while `shown`: under it,
 * or over it without the room below, lined up with its start (its right edge, right to
 * left), inside the window, and following it as the page or what it's in scrolls.
 * `matchWidth` makes it at least as wide as the anchor; `key` places it again as what's
 * in it changes.
 */
export function useAnchoredPosition(
  shown: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  popupRef: RefObject<HTMLElement | null>,
  { matchWidth = false, key }: { matchWidth?: boolean; key?: unknown } = {}
): void {
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const popup = popupRef.current;
    if (!shown || !anchor || !popup) return;
    function place() {
      if (!anchor || !popup) return;
      const box = anchor.getBoundingClientRect();
      const edge = 12;
      const gap = 4;
      // Its own height, up to the stylesheet's maximum.
      if (matchWidth) popup.style.minWidth = `${box.width}px`;
      popup.style.maxHeight = '';
      const { offsetWidth: width, offsetHeight: height } = popup;
      const roomBelow = window.innerHeight - edge - (box.bottom + gap);
      const roomAbove = box.top - gap - edge;
      const below = height <= roomBelow || roomBelow >= roomAbove;
      const room = Math.max(below ? roomBelow : roomAbove, 0);
      if (height > room) popup.style.maxHeight = `${room}px`;
      popup.style.top = `${below ? box.bottom + gap : box.top - gap - Math.min(height, room)}px`;
      const start = getComputedStyle(anchor).direction === 'rtl' ? box.right - width : box.left;
      popup.style.left = `${Math.max(edge, Math.min(start, window.innerWidth - edge - width))}px`;
    }
    // Not for the popup's own scrolling: placing it starts from its full height, which
    // would take its scroll back to the top.
    function onScroll(e: Event) {
      if (e.target !== popup) place();
    }
    place();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
    };
  }, [shown, key, anchorRef, popupRef, matchWidth]);
}
