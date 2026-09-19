import { useEffect, useRef, useState } from 'react';
import { formatDate, type DateFormatPref } from '../../lib/dateFormat';
import { useDateFormat } from '../hooks/useDateFormat';

const OPTIONS: { value: DateFormatPref; label: string }[] = [
  { value: 'dmy', label: 'DD/MM/YYYY' },
  { value: 'mdy', label: 'MM/DD/YYYY' },
  { value: 'ymd', label: 'YYYY/MM/DD' }
];

/** A native <select> can't show a plain example date in the closed box while
 *  keeping every open-list row in the same plain "format label" style — the
 *  selected <option>'s text is used for both, forcing one or the other to be
 *  inconsistent. This is a small custom listbox instead, so the trigger can show
 *  today's date in the chosen format while every menu row stays a bare label. */
export function DateFormatSelector() {
  const [pref, setPref] = useDateFormat();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent): void {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="date-format-picker" ref={containerRef}>
      <button
        type="button"
        className="date-format-trigger"
        title="Date format"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {formatDate(Date.now(), pref)}
      </button>
      {open && (
        <ul className="date-format-menu" role="listbox">
          {OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={pref === option.value}
                className={`date-format-menu-item${pref === option.value ? ' active' : ''}`}
                onClick={() => {
                  setPref(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
