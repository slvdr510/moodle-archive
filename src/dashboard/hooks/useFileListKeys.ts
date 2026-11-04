import { useEffect, type RefObject } from 'react';
import { enterKeyboardMode, isArrow, isRtl, menuOpen, withModifier } from './keyboardNavigation';
import { dialogOpen, isTypingField } from './useScrollFromAnywhere';

const ROW = '.file-row-header, .folder-row-header';

/**
 * Focuses `row`, with `list` scrolled to have it in its middle, so a held-down arrow
 * moves the list under a row that stays put — as far as the list goes: near its start
 * or end, it can't scroll far enough, and the row goes up or down instead.
 */
function focusInMiddle(list: HTMLElement, row: HTMLElement): void {
  enterKeyboardMode();
  row.focus({ preventScroll: true });
  // Where the row is in the list, measured from its list item: an open folder's header
  // stuck at the top (see .folder-row-header) isn't where it is in the list.
  const item = row.closest('li') ?? row;
  const top = item.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop + list.scrollTop;
  list.scrollTop = top + row.offsetHeight / 2 - list.clientHeight / 2;
}

/**
 * Moves the focus around a course's file list (`listRef`) with the keyboard:
 * - up and down from row to row, as shown (what's in a closed folder isn't), onto the
 *   first one if none has the focus yet, keeping it in the middle of the list (see
 *   focusInMiddle); down from the search box (`searchRef`) to the first one, and up
 *   from there back to it;
 * - left and right along the row, onto its buttons and back;
 * - Enter or the space bar opens the file, opens or closes the folder, or presses the
 *   button in focus.
 *
 * Left alone: typing in a field (but for down in the search box), shortcuts, and all
 * of it while a dialog or a menu is open.
 */
export function useFileListKeys(
  listRef: RefObject<HTMLElement | null>,
  searchRef: RefObject<HTMLInputElement | null>
): void {
  useEffect(() => {
    // Which row had the focus last, to go on from there if it's gone meanwhile: taken
    // by the mouse moving (see useKeyboardMode), or a row deleted from its own button.
    let lastRow = 0;

    function onKeyDown(e: KeyboardEvent): void {
      const list = listRef.current;
      if (!list || e.defaultPrevented || withModifier(e) || dialogOpen() || menuOpen()) return;
      const search = searchRef.current;
      const inSearch = search !== null && e.target === search;
      if (isTypingField(e.target) && !(inSearch && e.key === 'ArrowDown')) return;

      const rows = [...list.querySelectorAll<HTMLElement>(ROW)];
      const active = document.activeElement;
      const row = active instanceof HTMLElement && list.contains(active) ? active.closest<HTMLElement>(ROW) : null;
      const index = row ? rows.indexOf(row) : -1;
      if (index !== -1) lastRow = index;

      if (isArrow(e.key)) {
        e.preventDefault();
        if (rows.length === 0) return;
        if (!row) {
          lastRow = inSearch ? 0 : Math.min(lastRow, rows.length - 1);
          focusInMiddle(list, rows[lastRow]);
          return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          const nextIndex = index + (e.key === 'ArrowDown' ? 1 : -1);
          if (rows[nextIndex]) {
            lastRow = nextIndex;
            focusInMiddle(list, rows[nextIndex]);
          } else if (e.key === 'ArrowUp' && search) {
            search.focus();
          }
          return;
        }

        // Along the row: the row itself first, then its buttons as they're laid out.
        const stops = [row, ...row.querySelectorAll<HTMLElement>('button')].filter(
          (stop) => !stop.matches(':disabled') && stop.getClientRects().length > 0
        );
        const forward = (e.key === 'ArrowRight') !== isRtl(row);
        const next = stops[stops.indexOf(active as HTMLElement) + (forward ? 1 : -1)];
        next?.focus({ preventScroll: true });
      } else if ((e.key === 'Enter' || e.key === ' ') && row !== null && row === active) {
        // A button in focus is pressed by the browser itself.
        e.preventDefault();
        row.click();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listRef, searchRef]);
}
