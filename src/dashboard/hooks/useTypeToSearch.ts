import { useEffect, type RefObject } from 'react';
import { dialogOpen, isTypingField } from './useScrollFromAnywhere';

/**
 * Lets a search start by just typing, without clicking the search box first: a key
 * that types a character, pressed anywhere on the page, moves the focus into
 * `inputRef` before the browser acts on the key, so the character lands there, after
 * whatever the box already holds. A dead key (the ´ of an "á") counts too, so the
 * accented letter it starts is put together in the box.
 *
 * The keys that delete move it there too, and delete in the box: Backspace its last
 * character, Delete all of it (selected first, for the key itself to take, so Ctrl+Z
 * brings it back). From then on the focus is in the box, where keys work as usual.
 *
 * Ctrl+F (⌘F) does it too, in place of the browser's find bar.
 *
 * Left alone: typing in another field, other shortcuts (Ctrl, Alt, ⌘), the space bar (it
 * scrolls the list, or opens or presses what's in focus), and all of it while a
 * dialog is open.
 */
export function useTypeToSearch(inputRef: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const input = inputRef.current;
      if (!input || e.defaultPrevented || e.isComposing || dialogOpen()) return;

      // Ctrl+F (⌘F) goes to this search, with what's in it selected to type over,
      // instead of opening the browser's own find bar on top of it.
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        input.focus();
        input.select();
        return;
      }

      if (isTypingField(e.target)) return;
      // AltGr types characters too (@, #, €…), and Windows reports it as Ctrl+Alt.
      if ((e.ctrlKey || e.metaKey || e.altKey) && !e.getModifierState('AltGraph')) return;
      const typesCharacter = [...e.key].length === 1 && e.key !== ' ';
      // Not with Shift: Shift+Delete cuts, which would put the search on the clipboard.
      const deletes = (e.key === 'Backspace' || e.key === 'Delete') && !e.shiftKey;
      if (!typesCharacter && e.key !== 'Dead' && !deletes) return;

      input.focus();
      if (e.key === 'Delete') input.select();
      else input.setSelectionRange(input.value.length, input.value.length);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inputRef]);
}
