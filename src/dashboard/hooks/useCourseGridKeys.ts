import { useEffect, type RefObject } from 'react';
import { focusItem, isArrow, menuOpen, neighbor, withModifier } from './keyboardNavigation';
import { dialogOpen, isTypingField } from './useScrollFromAnywhere';

/**
 * Moves the focus around `listRef`'s course cards with the arrow keys — onto the
 * first one if none has it yet, or back onto the one it was on — and opens the course
 * in focus with Enter or the space bar.
 *
 * Left alone: typing in a field (a name being edited on a card), shortcuts, and all
 * of it while a dialog or a menu is open.
 */
export function useCourseGridKeys(listRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    // The card the arrow keys last moved to, to go on from if the mouse moving took the
    // focus away from it (see useKeyboardMode).
    let lastCard: HTMLElement | null = null;

    function onKeyDown(e: KeyboardEvent): void {
      const list = listRef.current;
      if (!list || e.defaultPrevented || withModifier(e) || dialogOpen() || menuOpen() || isTypingField(e.target)) return;
      const cards = [...list.querySelectorAll<HTMLElement>('.course-card')];
      const active = document.activeElement;
      // The card itself, or a button on it.
      const card = active instanceof HTMLElement ? active.closest<HTMLElement>('.course-card') : null;

      if (isArrow(e.key)) {
        e.preventDefault();
        const next =
          card && cards.includes(card)
            ? neighbor(cards, card, e.key)
            : lastCard && cards.includes(lastCard)
              ? lastCard
              : cards[0];
        if (next) {
          lastCard = next;
          focusItem(next);
        }
      } else if ((e.key === 'Enter' || e.key === ' ') && card !== null && card === active) {
        e.preventDefault();
        card.click();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listRef]);
}
