import { useLayoutEffect, type RefObject } from 'react';

/**
 * Sizes the file rows' date column to the widest date label actually shown in the
 * list, so it sits snug against both the badge before it and the buttons after it
 * while still lining up on every row. Sets `--file-date-width` on the list element;
 * until then (or where it can't measure) the CSS falls back to a fixed width.
 *
 * Re-measures whenever the list's contents change: rows loading their versions,
 * folders expanding, a language switch, a search.
 */
export function useDateColumnWidth(listRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function measure(): void {
      if (!list) return;
      let widest = 0;
      const range = document.createRange();
      for (const date of list.querySelectorAll<HTMLElement>('.file-date')) {
        range.selectNodeContents(date);
        // The text's own width, whatever width the column currently has.
        widest = Math.max(widest, range.getBoundingClientRect?.().width ?? 0);
      }
      const value = widest > 0 ? `${Math.ceil(widest)}px` : '';
      if (list.style.getPropertyValue('--file-date-width') !== value) {
        list.style.setProperty('--file-date-width', value);
      }
    }

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(list, { childList: true, subtree: true, characterData: true });
    // The labels change width once the web font replaces the fallback one.
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [listRef]);
}
