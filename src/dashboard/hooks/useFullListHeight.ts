import { useLayoutEffect, type RefObject } from 'react';

/**
 * Keeps on `listRef`'s list, as `--full-list-height`, how tall it is showing every
 * file, so a search can keep it that tall (see .file-list.searching) instead of
 * shrinking it down to what's found, or to the one line saying nothing was.
 *
 * Measured only while not `searching`: stopped in the same commit that shows the
 * results, before the list gets to shrink to them.
 */
export function useFullListHeight(listRef: RefObject<HTMLElement | null>, searching: boolean): void {
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || searching) return;

    function measure(): void {
      list!.style.setProperty('--full-list-height', `${list!.offsetHeight}px`);
    }

    measure();
    // Folders opening and closing, files coming in, the window resizing.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, searching]);
}
