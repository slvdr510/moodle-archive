import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from 'react';
import { hexDigits, parseHexColor } from '../../lib/hexColor';
import { useAnchoredPosition } from '../hooks/useAnchoredPosition';
import { useT } from '../hooks/useTranslation';

/**
 * A color's well that, pressed, opens a small menu under it to set the color: its
 * code written as it is — FFFFFF, with or without the #, or three digits (FFF) —
 * or, beside that, picked in the browser's own color picker.
 *
 * The code is taken as it's written once it's whole (six digits), and on Enter (three
 * too), which closes the menu; a code that isn't one is marked, the menu left open.
 * Escape, a click outside it or the focus going elsewhere close it too, keeping
 * what's been set. The focus goes to the code as it opens, and back to the well on
 * Enter or Escape.
 *
 * It hangs from the well in place, rather than from the page, so that it's in the
 * dialog's order to Tab through and what a click in it is a click in (not outside it).
 */
export function ColorMenu({
  value,
  label,
  className,
  style,
  disabled = false,
  onInput,
  onClose
}: {
  /** The color now, as "#rrggbb": what the menu opens with. */
  value: string;
  /** The well's tooltip, and the menu's name. */
  label: string;
  /** The well's own: it shows the color, or what stands for none. */
  className: string;
  style?: CSSProperties;
  disabled?: boolean;
  /** A color set: written or picked, as it's done. */
  onInput: (color: string) => void;
  /** The menu closed: what was set in it settled. Told once that's been rendered, so
   *  it's what's there to store. */
  onClose?: () => void;
}) {
  const t = useT();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  // The code as it's being written: its digits, without the #.
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const wasOpen = useRef(false);

  useAnchoredPosition(open, buttonRef, menuRef);

  // The code ready to be written over, as it opens.
  useLayoutEffect(() => {
    if (!open) return;
    fieldRef.current?.focus({ preventScroll: true });
    fieldRef.current?.select();
  }, [open]);

  // Right as it's rendered closed, along with what was set in it (see onClose).
  useLayoutEffect(() => {
    if (wasOpen.current && !open) onCloseRef.current?.();
    wasOpen.current = open;
  }, [open]);

  // A click anywhere else closes it — the well's own toggles it.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown, true);
    return () => document.removeEventListener('mousedown', onMouseDown, true);
  }, [open]);

  function show() {
    setText(value.replace(/^#/, ''));
    setInvalid(false);
    setOpen(true);
  }

  function hide(focusWell: boolean) {
    setOpen(false);
    if (focusWell) buttonRef.current?.focus({ preventScroll: true });
  }

  function set(color: string) {
    if (color !== value.toLowerCase()) onInput(color);
  }

  // The focus gone somewhere else on the page: not with it gone to the browser's
  // picker, a window of its own (nothing on the page to go to, then).
  function onFocusLeave(e: FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && !menuRef.current?.contains(next) && !buttonRef.current?.contains(next)) setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.isComposing) return;
    if (e.key === 'Escape') {
      // The menu's, not the dialog's (see useDialogKeys).
      e.preventDefault();
      hide(true);
    } else if (e.key === 'Enter' && e.target === fieldRef.current) {
      e.preventDefault();
      const color = parseHexColor(text);
      if (!color) {
        setInvalid(true);
        return;
      }
      set(color);
      hide(true);
    }
  }

  return (
    <span className="color-menu-anchor">
      <button
        ref={buttonRef}
        type="button"
        className={`color-menu-button ${className}`}
        style={style}
        disabled={disabled}
        title={label}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? hide(false) : show())}
      />
      {open && (
        <div ref={menuRef} id={menuId} role="dialog" aria-label={label} className="color-menu" onKeyDown={onKeyDown}>
          <span className={`color-menu-code${invalid ? ' invalid' : ''}`}>
            <span aria-hidden="true">#</span>
            <input
              ref={fieldRef}
              type="text"
              dir="ltr"
              spellcheck={false}
              autoComplete="off"
              placeholder="FFFFFF"
              aria-label={t.colorMenu.code}
              aria-invalid={invalid || undefined}
              title={t.colorMenu.codeHint}
              value={text}
              onChange={(e) => {
                const digits = hexDigits(e.currentTarget.value);
                // Anything else typed or pasted (the #, spaces) left out as it's written.
                if (e.currentTarget.value !== digits) e.currentTarget.value = digits;
                setText(digits);
                setInvalid(false);
                if (digits.length === 6) set(`#${digits.toLowerCase()}`);
              }}
              onBlur={onFocusLeave}
            />
          </span>
          <label className="color-menu-picker" title={t.colorMenu.more}>
            <input
              type="color"
              aria-label={t.colorMenu.more}
              value={value}
              onInput={(e) => {
                const color = e.currentTarget.value.toLowerCase();
                setText(color.slice(1));
                setInvalid(false);
                set(color);
              }}
              onBlur={onFocusLeave}
            />
          </label>
        </div>
      )}
    </span>
  );
}
