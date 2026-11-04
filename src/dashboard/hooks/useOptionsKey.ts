import { useEffect } from 'react';
import { menuOpen } from './keyboardNavigation';
import { dialogOpen, isTypingField } from './useScrollFromAnywhere';

/**
 * The Shift key goes to the options of what has the focus — the card or row itself, or
 * a button on it: a course card's "⋮" menu opens; on a file or folder row, the focus
 * goes straight to its download button (for Enter to press it), from where the arrow
 * keys go on along the row's other buttons as ever.
 *
 * Only Shift tapped on its own: let go with no other key pressed meanwhile, and not
 * held down. Shift with a letter types a capital (into the search, say); that mustn't
 * open anything. Left alone, too: typing in a field, and while a dialog or a menu is
 * open.
 */
export function useOptionsKey(): void {
  useEffect(() => {
    let tapped = false;

    function onKeyDown(e: KeyboardEvent): void {
      tapped = e.key === 'Shift' && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey;
    }

    function onKeyUp(e: KeyboardEvent): void {
      if (e.key !== 'Shift' || !tapped) return;
      tapped = false;
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || isTypingField(active) || dialogOpen() || menuOpen()) return;

      const card = active.closest('.course-card');
      if (card) {
        card.querySelector<HTMLElement>('.menu-button')?.click();
        return;
      }
      active
        .closest('.file-row-header, .folder-row-header')
        ?.querySelector<HTMLElement>('.download-button:not(:disabled)')
        ?.focus({ preventScroll: true });
    }

    function cancel(): void {
      tapped = false;
    }

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('mousedown', cancel, true);
    window.addEventListener('blur', cancel);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('mousedown', cancel, true);
      window.removeEventListener('blur', cancel);
    };
  }, []);
}
