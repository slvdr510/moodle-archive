import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

/** A "⋮" button that opens a small floating menu of actions — shared by
 *  CourseRow's per-course menu and the courses toolbar's overflow menu. */
export function DropdownMenu({
  items,
  title = 'More options',
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
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
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
      // Anchored by its right edge (rather than a fixed width) so the menu can
      // size itself to whatever its longest item needs to fit on one line.
      setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  }

  return (
    <>
      <button
        ref={buttonRef}
        className={buttonClassName}
        title={title}
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
            style={{ top: position.top, right: position.right }}
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
