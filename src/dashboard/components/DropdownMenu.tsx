import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../hooks/useTranslation';
import { MenuIcon, type MenuIconName } from './MenuIcon';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  /** Shown at its start. */
  icon?: MenuIconName;
}

/** Where a menu hangs from: the top and bottom edges of what it's for, and the x the
 *  menu's middle lines up with. */
export interface MenuAnchor {
  top: number;
  bottom: number;
  centerX: number;
}

export function anchorOf(el: Element): MenuAnchor {
  const rect = el.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom, centerX: rect.left + rect.width / 2 };
}

/**
 * A small floating menu of actions, hanging from `anchor` (see DropdownMenu). It closes
 * on a click outside it (but in `ignoreClicksIn`: the button that toggles it), on
 * Escape, once the focus leaves it, and if the page scrolls or resizes, rather than
 * drift.
 *
 * From the keyboard: as it opens, the focus goes to its first item; the up and down
 * arrows move it, Enter or the space bar picks the item in focus. Closed without
 * picking one, it gives the focus back to what had it before.
 */
export function MenuPopup({
  anchor,
  items,
  onClose,
  ignoreClicksIn
}: {
  anchor: MenuAnchor;
  items: DropdownMenuItem[];
  onClose: () => void;
  ignoreClicksIn?: RefObject<HTMLElement | null>;
}) {
  // Where the menu goes, once it's been measured — see the layout effect below.
  const [position, setPosition] = useState<{ left: number; top: number; maxHeight?: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);
  const picked = useRef(false);

  // Layout effects, here and below: set up as the menu shows, not a frame later, so a
  // key pressed right away (Escape, an arrow) already finds them.
  useLayoutEffect(() => {
    function onDocumentMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (ignoreClicksIn?.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    }
    // Taken here, before anything else on the page goes on to act on these keys too
    // (going back from a course's page, moving through a list).
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const buttons = [...(menuRef.current?.querySelectorAll('button') ?? [])];
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const last = buttons.length - 1;
      const next =
        e.key === 'Home' ? 0
        : e.key === 'End' ? last
        : index === -1 ? (e.key === 'ArrowDown' ? 0 : last)
        : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
    // Not on the button that toggles it: a click there closing it first would have the
    // click open it again.
    function onFocusIn(e: FocusEvent) {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !ignoreClicksIn?.current?.contains(target)) onClose();
    }
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    // The menu is positioned by viewport coordinates at open time; if the page
    // scrolls or resizes while it's open, just close it rather than let it drift.
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose, ignoreClicksIn]);

  // Centered under the anchor. The menu sizes itself to its
  // items, so it's only placed once its size is known (before it's painted), always
  // inside the window: near a side it's shifted just enough; without room below the
  // anchor it opens above it instead; and with room on neither side, it goes where
  // there's more, as tall as that room, scrolling.
  useLayoutEffect(() => {
    if (position !== null || !menuRef.current) return;
    const { offsetWidth: width, offsetHeight: height } = menuRef.current;
    const edge = 12;
    const gap = 4;
    const centered = anchor.centerX - width / 2;
    const left = Math.max(edge, Math.min(centered, window.innerWidth - edge - width));

    const roomBelow = window.innerHeight - edge - (anchor.bottom + gap);
    const roomAbove = anchor.top - gap - edge;
    if (height <= roomBelow) {
      setPosition({ left, top: anchor.bottom + gap });
    } else if (height <= roomAbove) {
      setPosition({ left, top: anchor.top - gap - height });
    } else if (roomBelow >= roomAbove) {
      setPosition({ left, top: anchor.bottom + gap, maxHeight: roomBelow });
    } else {
      setPosition({ left, top: edge, maxHeight: roomAbove });
    }
  }, [position, anchor]);

  // In focus as soon as it's in place; back out of it once it's gone, unless an item
  // was picked (what it does may put the focus somewhere itself: a dialog, a field)
  // or the focus already went elsewhere.
  useLayoutEffect(() => {
    if (position === null) return;
    returnTo.current ??= document.activeElement;
    menuRef.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [position]);
  useLayoutEffect(
    () => () => {
      const active = document.activeElement;
      const focusInMenu = active === document.body || (menuRef.current?.contains(active) ?? false);
      if (!picked.current && focusInMenu && returnTo.current instanceof HTMLElement && returnTo.current.isConnected) {
        returnTo.current.focus({ preventScroll: true });
      }
    },
    []
  );

  return createPortal(
    <div
      ref={menuRef}
      className="dropdown-menu"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        maxHeight: position?.maxHeight,
        overflowY: position?.maxHeight !== undefined ? 'auto' : undefined,
        visibility: position === null ? 'hidden' : undefined
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          className={item.danger ? 'danger-item' : undefined}
          onClick={() => {
            picked.current = true;
            onClose();
            item.onClick();
          }}
        >
          {item.icon && <MenuIcon name={item.icon} />}
          <span className="dropdown-menu-label">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

/** A "⋮" button that opens a small floating menu of actions — shared by
 *  CourseCard's per-course menu and the courses toolbar's overflow menu. */
export function DropdownMenu({
  items,
  title,
  disabled = false,
  buttonClassName = 'menu-button',
  onOpenChange
}: {
  items: DropdownMenuItem[];
  title?: string;
  disabled?: boolean;
  /** Row- and card-level menus (e.g. CourseCard) want the small, subtle icon-button look
   *  (the default); a toolbar's overflow menu wants to read as a real button. */
  buttonClassName?: string;
  /** Lets a container (e.g. CourseCard) know the menu is open, so it can keep
   *  itself styled as if hovered — otherwise its hover-revealed buttons fade
   *  out the moment the mouse leaves for the portaled menu below it. */
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useT();
  // Open while it has somewhere to hang from: the button, as it was when clicked.
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const open = anchor !== null;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setAnchor(null), []);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={buttonRef}
        className={buttonClassName}
        title={title ?? t.common.moreOptions}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(open || !buttonRef.current ? null : anchorOf(buttonRef.current));
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {anchor && <MenuPopup anchor={anchor} items={items} onClose={close} ignoreClicksIn={buttonRef} />}
    </>
  );
}
