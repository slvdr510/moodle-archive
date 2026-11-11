import { useEffect, type RefObject } from 'react';

// A page key's share of the list's height: the browser's own.
const PAGE_SHARE = 0.875;

/** Whether `el` or something it's in scrolls by itself, and so takes the wheel or the
 *  keys there on its own. */
function inScroller(el: Element | null): boolean {
  for (; el; el = el.parentElement) {
    if (el.scrollHeight <= el.clientHeight) continue;
    if (el === document.scrollingElement) return true;
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return true;
  }
  return false;
}

export function dialogOpen(): boolean {
  return document.querySelector('.modal-backdrop') !== null;
}

/** Whether `el` takes typing itself: a text field, a list to pick from, an editable area. */
export function isTypingField(el: EventTarget | null): boolean {
  return el instanceof HTMLElement && (el.isContentEditable || el.matches('input, textarea, select'));
}

/** Whether Escape pressed in `el` is for it alone: a field being typed in, where it
 *  cancels what's being written (a course's tag). Not one marked
 *  data-passes-escape, which has nothing to cancel — a search box: there Escape does
 *  what it does on the rest of the page. */
export function keepsEscape(el: EventTarget | null): boolean {
  return isTypingField(el) && !(el as HTMLElement).hasAttribute('data-passes-escape');
}

/**
 * Lets the mouse wheel and the keyboard (page keys, Home/End, space) scroll
 * `listRef`'s list from anywhere on the window, not only with the pointer over it or
 * the focus in it. A course's page doesn't scroll itself, only its file list does (see
 * .course-files-page), so over the toolbar or the margins they'd otherwise do nothing.
 * The arrow keys move from row to row instead (see useFileListKeys).
 *
 * Left alone: whatever scrolls on its own under the pointer or the focus (the list
 * itself, an open menu that overflows), typing in a field, and all of it while a
 * dialog is open. But in `searchRef`'s box, the list's search, the page keys still
 * scroll it: there they'd do next to nothing to the one line of text, and the results
 * come right after typing the search.
 */
export function useScrollFromAnywhere(
  listRef: RefObject<HTMLElement | null>,
  searchRef?: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    // Eased toward `target` a frame at a time, so a wheel's notch glides like the
    // browser's own scrolling instead of jumping, while a touchpad's stream of small
    // moves (or a held-down key) just keeps pushing the target further on.
    let target = 0;
    let position = 0;
    let written = 0;
    let lastTime = 0;
    let frame = 0;

    function step(now: number): void {
      const list = listRef.current;
      // Scrolled some other way meanwhile (the wheel over the list, its scrollbar):
      // that one wins.
      if (!list || Math.abs(list.scrollTop - written) > 1) {
        frame = 0;
        return;
      }
      const elapsed = lastTime ? now - lastTime : 1000 / 60;
      lastTime = now;
      // About two thirds of what's left every 60 ms, whatever the frame rate.
      position += (target - position) * (1 - Math.exp(-Math.max(elapsed, 0) / 60));
      if (Math.abs(target - position) < 0.5) position = target;
      list.scrollTop = position;
      written = list.scrollTop;
      frame = position === target ? 0 : requestAnimationFrame(step);
    }

    function scrollTo(list: HTMLElement, top: number): void {
      target = Math.min(Math.max(top, 0), list.scrollHeight - list.clientHeight);
      if (frame) return;
      position = written = list.scrollTop;
      lastTime = 0;
      frame = requestAnimationFrame(step);
    }

    // On from where a glide still under way is headed, not from where it's got to.
    function scrollBy(list: HTMLElement, delta: number): void {
      scrollTo(list, (frame ? target : list.scrollTop) + delta);
    }

    function onWheel(e: WheelEvent): void {
      const list = listRef.current;
      // Ctrl+wheel zooms.
      if (!list || e.ctrlKey || e.deltaY === 0 || dialogOpen()) return;
      if (inScroller(e.target instanceof Element ? e.target : null)) return;
      scrollBy(list, e.deltaY);
    }

    function onKeyDown(e: KeyboardEvent): void {
      const list = listRef.current;
      if (!list || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || dialogOpen()) return;
      const focused = e.target instanceof Element ? e.target : null;
      const inSearch = focused !== null && focused === searchRef?.current;
      if (inSearch ? !['PageUp', 'PageDown'].includes(e.key) : isTypingField(focused) || inScroller(focused)) {
        return;
      }

      const page = list.clientHeight * PAGE_SHARE;
      switch (e.key) {
        case 'PageUp':
          scrollBy(list, -page);
          break;
        case 'PageDown':
          scrollBy(list, page);
          break;
        case 'Home':
          scrollTo(list, 0);
          break;
        case 'End':
          scrollTo(list, list.scrollHeight);
          break;
        case ' ':
          // Anything focused may take the space bar for itself (a button, to press it).
          if (focused !== document.body) return;
          scrollBy(list, e.shiftKey ? -page : page);
          break;
        default:
          return;
      }
      e.preventDefault();
    }

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [listRef, searchRef]);
}
