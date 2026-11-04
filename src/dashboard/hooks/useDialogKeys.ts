import { useEffect } from 'react';
import { focusItem, isArrow, neighbor, withModifier } from './keyboardNavigation';
import { isTypingField } from './useScrollFromAnywhere';

function topmostDialog(): HTMLElement | undefined {
  const dialogs = document.querySelectorAll<HTMLElement>('.modal-backdrop');
  return dialogs[dialogs.length - 1];
}

/** What in `dialog` can take the focus: not what's disabled or hidden, nor what's in
 *  another dialog opened from it. */
function focusablesIn(dialog: HTMLElement): HTMLElement[] {
  return [...dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]')].filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.matches(':disabled') &&
      el.getClientRects().length > 0 &&
      el.closest('.modal-backdrop') === dialog
  );
}

/** Where the focus goes as `dialog` opens: what it marks for that, else the first
 *  thing that can take it. */
function initialFocus(dialog: HTMLElement): HTMLElement | undefined {
  return dialog.querySelector<HTMLElement>('[data-autofocus]') ?? focusablesIn(dialog)[0];
}

/** A field the arrow keys work in — a text box, a list to pick from, a slider, a set
 *  of radio buttons — rather than move the focus out of. Not a checkbox. */
function takesArrows(el: EventTarget | null): boolean {
  return isTypingField(el) && !(el instanceof HTMLInputElement && el.type === 'checkbox');
}

/**
 * The keyboard in dialogs (.modal-backdrop): as one opens, the focus goes into it (see
 * initialFocus), and once it closes, back to where it was, if that's still there. The
 * arrow keys move it around the dialog's buttons and fields; Escape closes it, as a
 * click outside it does. Enter and the space bar press the button in focus, as ever.
 */
export function useDialogKeys(): void {
  useEffect(() => {
    // The dialogs open, oldest first, each with what had the focus before it opened.
    let open: { dialog: HTMLElement; returnTo: Element | null }[] = [];

    function sync(): void {
      const dialogs = [...document.querySelectorAll<HTMLElement>('.modal-backdrop')];
      const closed = open.filter(({ dialog }) => !dialogs.includes(dialog));
      open = open.filter(({ dialog }) => dialogs.includes(dialog));
      // Newest first, so with several closing at once the focus ends up where it was
      // before the oldest of them.
      for (const { returnTo } of closed.reverse()) {
        if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({ preventScroll: true });
      }
      for (const dialog of dialogs) {
        if (open.some((o) => o.dialog === dialog)) continue;
        open.push({ dialog, returnTo: document.activeElement });
        // Unless a field in it already took it (autoFocus).
        if (!dialog.contains(document.activeElement)) initialFocus(dialog)?.focus({ preventScroll: true });
      }
    }

    function onKeyDown(e: KeyboardEvent): void {
      const dialog = topmostDialog();
      if (!dialog || e.defaultPrevented || withModifier(e)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        dialog.click();
        return;
      }
      if (!isArrow(e.key) || takesArrows(e.target)) return;
      e.preventDefault();
      const items = focusablesIn(dialog);
      const current = items.find((item) => item === document.activeElement);
      const next = current ? neighbor(items, current, e.key) : initialFocus(dialog);
      if (next) focusItem(next);
    }

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}
