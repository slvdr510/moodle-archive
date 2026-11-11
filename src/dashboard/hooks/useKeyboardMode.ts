import { useEffect } from 'react';
import { isTypingField } from './useScrollFromAnywhere';

// How far from where it was the pointer has to go to take over from the keyboard. A
// mouse no one is moving can still report moves — a trackpad under a resting finger, a
// sensor's jitter, the browser itself as what's under the pointer scrolls — but those
// stay within a pixel or two of where it was; moving it means getting away from there.
const TAKE_OVER_DISTANCE_PX = 6;

/**
 * Keyboard or mouse, whichever is being used to move around. Once the arrow keys move
 * the focus (see enterKeyboardMode), the lists ignore the pointer, so only what's in
 * focus shows, not whatever happens to be under the pointer too (see
 * [data-keyboard-nav] in styles.css). Once the mouse really moves, the pointer counts
 * again, and what the arrow keys left in focus in a list loses it, so only what's under
 * the pointer shows; the next arrow key goes on from there all the same (see
 * useCourseGridKeys and useFileListKeys). Likewise what's in focus in a list, shown as
 * under the pointer, without the arrow keys having been used: a course's card the
 * focus went back to as a dialog or menu was closed from the keyboard. Otherwise,
 * once the pointer has been over it and left, it'd still look as if under it.
 */
export function useKeyboardMode(): void {
  useEffect(() => {
    const root = document.documentElement;
    // Where the pointer last was, on the screen; and where it was as the keyboard took
    // over, which is what it has to get away from.
    let last: { x: number; y: number } | null = null;
    let anchor: { x: number; y: number } | null = null;

    function onMouseMove(e: MouseEvent): void {
      const here = { x: e.screenX, y: e.screenY };
      if (!('keyboardNav' in root.dataset) && !focusShownInList()) {
        last = here;
        anchor = null;
        return;
      }
      anchor ??= last ?? here;
      last = here;
      if (Math.hypot(here.x - anchor.x, here.y - anchor.y) < TAKE_OVER_DISTANCE_PX) return;

      anchor = null;
      delete root.dataset.keyboardNav;
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.closest('.file-list, .course-list')) active.blur();
    }

    window.addEventListener('mousemove', onMouseMove, true);
    return () => {
      window.removeEventListener('mousemove', onMouseMove, true);
      delete root.dataset.keyboardNav;
    };
  }, []);
}

/** What in a list has the focus and shows it, as if under the pointer (see the
 *  :focus-visible rules in styles.css). Not a field being typed in. */
function focusShownInList(): HTMLElement | undefined {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || !active.closest('.file-list, .course-list') || isTypingField(active)) return undefined;
  return active.matches(':focus-visible') ? active : undefined;
}
