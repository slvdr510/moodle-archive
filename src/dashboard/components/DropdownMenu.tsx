import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../hooks/useTranslation';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
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
  const [open, setOpen] = useState(false);
  // The button the menu hangs from: its top and bottom edges, and the x the menu's
  // middle lines up with.
  const [anchor, setAnchor] = useState({ top: 0, bottom: 0, centerX: 0 });
  // Where the menu goes, once it's been measured — see the layout effect below.
  const [position, setPosition] = useState<{ left: number; top: number; maxHeight?: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    function close() {
      setOpen(false);
    }
    function onDocumentMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener('mousedown', onDocumentMouseDown);
    // The menu is positioned by viewport coordinates at open time; if the page
    // scrolls or resizes while it's open, just close it rather than let it drift.
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setAnchor({ top: rect.top, bottom: rect.bottom, centerX: rect.left + rect.width / 2 });
    }
    setPosition(null);
    setOpen(true);
  }

  // Centered under the button. The menu sizes itself to its items, so it's only placed
  // once its size is known (before it's painted), always inside the window: near a
  // side it's shifted just enough; without room below the button it opens above it
  // instead; and with room on neither side, it goes where there's more, as tall as
  // that room, scrolling.
  useLayoutEffect(() => {
    if (!open || position !== null || !dropdownRef.current) return;
    const { offsetWidth: width, offsetHeight: height } = dropdownRef.current;
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
  }, [open, position, anchor]);

  return (
    <>
      <button
        ref={buttonRef}
        className={buttonClassName}
        title={title ?? t.common.moreOptions}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
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
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
