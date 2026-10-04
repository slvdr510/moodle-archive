import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../hooks/useTranslation';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

/** A "⋮" button that opens a small floating menu of actions — shared by
 *  CourseRow's per-course menu and the courses toolbar's overflow menu. */
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
  /** Row-level menus (e.g. CourseRow) want the small, subtle icon-button look
   *  (the default); a toolbar's overflow menu wants to read as a real button. */
  buttonClassName?: string;
  /** Lets a container (e.g. CourseRow) know the menu is open, so it can keep
   *  itself styled as if hovered — otherwise its hover-revealed buttons fade
   *  out the moment the mouse leaves for the portaled menu below it. */
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  // Where the menu hangs from: its top edge, and the x its middle lines up with.
  const [anchor, setAnchor] = useState({ top: 0, centerX: 0 });
  // The menu's left edge, once it's been measured — see the layout effect below.
  const [left, setLeft] = useState<number | null>(null);
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
      setAnchor({ top: rect.bottom + 4, centerX: rect.left + rect.width / 2 });
    }
    setLeft(null);
    setOpen(true);
  }

  // Centered under the button. The menu sizes itself to its longest item, so it's only
  // placed once its width is known (before it's painted); near a window edge it's
  // shifted just enough to stay inside the window.
  useLayoutEffect(() => {
    if (!open || left !== null || !dropdownRef.current) return;
    const width = dropdownRef.current.offsetWidth;
    const edge = 12;
    const centered = anchor.centerX - width / 2;
    setLeft(Math.max(edge, Math.min(centered, window.innerWidth - edge - width)));
  }, [open, left, anchor]);

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
            style={{ top: anchor.top, left: left ?? 0, visibility: left === null ? 'hidden' : undefined }}
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
