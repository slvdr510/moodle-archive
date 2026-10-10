import { useEffect, useState, type RefObject } from 'react';

/** `ref`'s current size in px, kept up to date as it resizes (the window, the side
 *  margin setting...), or `fallback` until measured or where ResizeObserver is missing. */
function useElementSize(
  ref: RefObject<HTMLElement | null>,
  dimension: 'width' | 'height',
  fallback: number
): number {
  const [size, setSize] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setSize(entry.contentRect[dimension]));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, dimension]);

  return size;
}

/** `ref`'s current width in px — Infinity until measured. */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  return useElementSize(ref, 'width', Infinity);
}

/** `ref`'s current height in px — 0 until measured. */
export function useElementHeight(ref: RefObject<HTMLElement | null>): number {
  return useElementSize(ref, 'height', 0);
}
