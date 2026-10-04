import { useEffect, useState, useSyncExternalStore } from 'react';
import { contentWidth, getSideMargin, setSideMargin, subscribeSideMargin } from '../../lib/sideMargin';

/** Backed by a module-level store (see sideMargin.ts), same as useRecentSettings. */
export function useSideMargin(): [number, (percent: number) => void] {
  const margin = useSyncExternalStore(subscribeSideMargin, getSideMargin);
  return [margin, setSideMargin];
}

/** The content's CSS width, kept up to date on zoom or a change of screen. */
export function useContentWidth(): string {
  const [margin] = useSideMargin();
  return contentWidth(margin, useScreenWidth());
}

/** The screen's width in CSS px. Zooming fires `resize` and changes screen.width;
 *  so does moving the window to another monitor. */
export function useScreenWidth(): number {
  const [screenWidth, setScreenWidth] = useState(() => window.screen.width);

  useEffect(() => {
    const onResize = () => setScreenWidth(window.screen.width);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return screenWidth;
}
