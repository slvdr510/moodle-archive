import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredPosition } from '../hooks/useAnchoredPosition';

/** A row of the list: one of the options, or what's typed, to add as a new one. */
interface Row {
  value: string;
  isNew: boolean;
}

/** Compared without case or accents, so typing "uhu" finds "UHU". */
function folded(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/**
 * A field with a list dropping from it of what's already in use (the institutions set
 * on courses, their academic years), to pick one of those rather than type it again —
 * and, while something new is typed, a last row to add that. Typing narrows the list
 * down to what contains it; the arrow at the field's end shows them all again.
 *
 * The focus stays in the field throughout, the rows only highlighted
 * (aria-activedescendant): the down and up arrows move through them, Enter picks the
 * one highlighted. With none highlighted, Enter closes the list and, with the down
 * arrow past the last row, is left to what's around the field (in "Edit course info":
 * storing what's typed); so is Escape, always.
 * Given onDelete, each option can be asked to be deleted too: with the bin at its end,
 * or the Delete key while it's highlighted.
 *
 * The list hangs from the field outside whatever it's in (a card cuts off what
 * overflows it), under the field, or over it without the room below, and follows it
 * as the page scrolls.
 */
export function ComboBox({
  inputRef,
  id,
  field,
  className = '',
  value,
  onValueChange,
  options,
  current,
  newOption,
  addLabel,
  toggleLabel,
  onPick,
  onDelete,
  deleteLabel,
  optionColor,
  onBlur,
  placeholder,
  invalid = false,
  describedBy
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  id?: string;
  /** Marks the field as data-field, to find it by. */
  field?: string;
  /** The field's own class (the wrapper's is combo-box). */
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** What's already in use, in the order to list it. */
  options: string[];
  /** The one set now, checked in the list. */
  current?: string;
  /** What adding what's typed would add, as it'd be saved; undefined when there's
   *  nothing new to add — nothing typed, nothing valid, or one of the options already. */
  newOption?: (typed: string) => string | undefined;
  addLabel: (value: string) => string;
  /** The arrow's tooltip. */
  toggleLabel: string;
  /** A row picked, from the keyboard (Enter) or not (a click). */
  onPick: (value: string, withKeyboard: boolean) => void;
  /** An option asked to be deleted: what's around the field asks to confirm it, and
   *  takes it out of `options` if so. */
  onDelete?: (value: string) => void;
  /** The bin's label, for an option. */
  deleteLabel?: (value: string) => string;
  /** An option's color, shown as a dot before it, if it has one. */
  optionColor?: (value: string) => string | undefined;
  /** The field left. */
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  /** The id of what says what's wrong with it. */
  describedBy?: string;
}) {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // What's been typed since the list was last shown whole (as it opens, or from the
  // arrow): null to list every option.
  const [filter, setFilter] = useState<string | null>(null);
  // The highlighted row, or -1 for none.
  const [active, setActive] = useState(-1);

  const typed = filter === null ? '' : folded(filter);
  const rows: Row[] = options.filter((option) => !typed || folded(option).includes(typed)).map((option) => ({ value: option, isNew: false }));
  const added = newOption?.(value);
  if (added !== undefined) rows.push({ value: added, isNew: true });
  const shown = open && rows.length > 0;
  const rowsKey = rows.map((row) => `${row.isNew ? '+' : '='}${row.value}`).join('\n');

  useAnchoredPosition(shown, inputRef, listRef, { matchWidth: true, key: rowsKey });

  // The highlighted row kept in sight, in a list long enough to scroll.
  useLayoutEffect(() => {
    if (active >= 0) listRef.current?.children[active]?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);

  function show(all: boolean, highlight = -1) {
    if (all) setFilter(null);
    setActive(highlight);
    setOpen(true);
  }

  function hide() {
    setOpen(false);
    setFilter(null);
    setActive(-1);
  }

  function pick(row: Row, withKeyboard: boolean) {
    hide();
    onPick(row.value, withKeyboard);
  }

  function askToDelete(row: Row) {
    hide();
    onDelete?.(row.value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.isComposing || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === 'ArrowDown') {
      if (rows.length === 0) return;
      if (!shown) {
        // Alt+Down only shows it; Down highlights its first row too.
        e.preventDefault();
        show(false, e.altKey ? -1 : 0);
      } else if (!e.altKey && active < rows.length - 1) {
        e.preventDefault();
        setActive(active + 1);
      }
    } else if (e.key === 'ArrowUp') {
      if (!shown || active === -1 || e.altKey) return;
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'Enter') {
      if (!shown || e.altKey) return;
      // None highlighted: what's typed is taken as it is, by what's around the field.
      if (active === -1) {
        hide();
        return;
      }
      e.preventDefault();
      pick(rows[active], true);
    } else if (e.key === 'Delete') {
      // Otherwise, the character after the caret.
      if (!onDelete || !shown || active === -1 || rows[active].isNew || e.altKey) return;
      e.preventDefault();
      askToDelete(rows[active]);
    }
  }

  const rowId = (index: number) => `${listId}-${index}`;

  return (
    <div className={`combo-box${shown ? ' open' : ''}${options.length > 0 ? ' with-toggle' : ''}`}>
      <input
        ref={inputRef}
        id={id}
        data-field={field}
        className={`${className}${invalid ? ' invalid' : ''}`}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={listId}
        aria-activedescendant={shown && active >= 0 ? rowId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onKeyDown={onKeyDown}
        onBlur={() => {
          hide();
          onBlur?.();
        }}
        onMouseDown={() => !open && show(true)}
        onChange={(e) => {
          onValueChange(e.currentTarget.value);
          setFilter(e.currentTarget.value);
          setActive(-1);
          setOpen(true);
        }}
      />
      {/* Only for the mouse, the keyboard having the down arrow: out of the tab order,
          and never taking the focus from the field. */}
      {options.length > 0 && (
        <button
          type="button"
          className="combo-box-toggle"
          tabIndex={-1}
          aria-hidden="true"
          title={toggleLabel}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const wasShown = shown;
            inputRef.current?.focus();
            if (wasShown) hide();
            else show(true);
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
      {shown &&
        createPortal(
          // A click on it keeps the focus in the field.
          <div ref={listRef} id={listId} role="listbox" className="combo-box-list" onMouseDown={(e) => e.preventDefault()}>
            {rows.map((row, index) => {
              const checked = !row.isNew && row.value === current;
              return (
                <div
                  key={`${row.isNew ? '+' : '='}${row.value}`}
                  id={rowId(index)}
                  role="option"
                  aria-selected={index === active}
                  className={`combo-box-option${index === active ? ' active' : ''}${row.isNew ? ' new' : ''}${checked ? ' current' : ''}`}
                  onClick={() => pick(row, false)}
                >
                  {row.isNew ? (
                    <>
                      <svg className="combo-box-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      {/* What's typed kept whole, in its own direction, inside the sentence. */}
                      <span className="combo-box-option-label">{addLabel(`\u2068${row.value}\u2069`)}</span>
                    </>
                  ) : (
                    <>
                      {optionColor?.(row.value) && (
                        <span className="combo-box-dot" style={{ background: optionColor(row.value) }} aria-hidden="true" />
                      )}
                      <bdi className="combo-box-option-label">{row.value}</bdi>
                      {checked && (
                        <svg className="combo-box-icon combo-box-check" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5 9-10" />
                        </svg>
                      )}
                      {/* For the mouse, as the arrow is; from the keyboard, the Delete key. */}
                      {onDelete && (
                        <button
                          type="button"
                          className="combo-box-delete"
                          tabIndex={-1}
                          aria-label={deleteLabel?.(row.value)}
                          title={deleteLabel?.(row.value)}
                          onClick={(e) => {
                            e.stopPropagation();
                            askToDelete(row);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
