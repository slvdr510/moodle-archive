import { useEffect, useRef, useState } from 'react';
import { LOCALE_NAMES, resolveLocale, type LanguagePref, type Locale } from '../../lib/i18n';
import { useLanguage, useT } from '../hooks/useTranslation';

/** A small custom listbox: the trigger shows the active language's code, the menu
 *  each language by its own name. */
export function LanguageSelector() {
  const t = useT();
  const [pref, setPref] = useLanguage();
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

  const options: { value: LanguagePref; label: string }[] = [
    { value: 'auto', label: t.header.languageAuto },
    ...(Object.keys(LOCALE_NAMES) as Locale[]).map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] }))
  ];

  return (
    <div className="header-picker" ref={containerRef}>
      <button
        type="button"
        className="header-picker-trigger"
        title={t.header.language}
        aria-label={t.header.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {resolveLocale(pref).toUpperCase()}
      </button>
      {open && (
        <ul className="header-picker-menu" role="listbox">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={pref === option.value}
                className={`header-picker-item${pref === option.value ? ' active' : ''}`}
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
