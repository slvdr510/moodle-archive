import { useId, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  APPEARANCE_COLORS,
  effectiveColor,
  getAppearance,
  paletteOf,
  PALETTES,
  resetAppearance,
  setAppearanceColor,
  setAppearanceColors,
  shownMode,
  subscribeAppearance,
  type AppearanceMode,
  type PaletteName
} from '../../lib/appearance';
import { applyTheme, getStoredTheme } from '../../lib/theme';
import { useT } from '../hooks/useTranslation';
import { ColorMenu } from './ColorMenu';
import { ConfirmModal } from './ConfirmModal';

/**
 * "Appearance": every color of the interface (see appearance.ts), for the light theme
 * and the dark one, each set from its well (a ColorMenu: its code written, or the
 * browser's picker) and taken back to its own from the arrow beside it — or all of a
 * theme's at once, once that's confirmed. Or a palette picked for it, to start from:
 * one of PALETTES, in the theme being set — confirmed first if what it'd replace is
 * colors set by hand rather than another palette's.
 *
 * What's set shows at once, and is kept as it's set: there's nothing to save. The page
 * is shown in the theme being set while it's open, so what's set is seen as it's set;
 * closed, it's back in the one chosen.
 */
export function AppearanceModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const titleId = useId();
  const appearance = useSyncExternalStore(subscribeAppearance, getAppearance);
  const [mode, setMode] = useState<AppearanceMode>(() => shownMode());
  const [confirmReset, setConfirmReset] = useState(false);
  // A palette picked over colors set by hand, waiting to be confirmed.
  const [pendingPalette, setPendingPalette] = useState<PaletteName | null>(null);
  const changed = Object.keys(appearance[mode]).length > 0;
  const currentPalette = paletteOf(appearance, mode);

  function applyPalette(name: PaletteName) {
    setAppearanceColors(mode, PALETTES.find((p) => p.name === name)!.colors[mode]);
  }

  // The page in the theme being set; back in the one chosen as it closes.
  useLayoutEffect(() => {
    applyTheme(mode);
  }, [mode]);
  useLayoutEffect(() => () => applyTheme(getStoredTheme()), []);

  const modes: AppearanceMode[] = ['light', 'dark'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal appearance-modal" role="dialog" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id={titleId}>{t.appearance.title}</h2>
          <button className="modal-close-button" onClick={onClose} title={t.common.close} aria-label={t.common.close}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="appearance-modes" role="radiogroup" aria-label={t.header.theme}>
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className={`appearance-mode${mode === m ? ' active' : ''}`}
              data-autofocus={mode === m || undefined}
              onClick={() => setMode(m)}
            >
              {m === 'light' ? t.header.themeLight : t.header.themeDark}
            </button>
          ))}
        </div>

        <div className="appearance-palettes" role="group" aria-label={t.appearance.palettes}>
          {PALETTES.map((palette) => {
            const colors = { light: {}, dark: {}, [mode]: palette.colors[mode] };
            const color = (name: 'bg' | 'surface' | 'fg' | 'muted' | 'accent' | 'border') => effectiveColor(colors, mode, name);
            return (
              <button
                key={palette.name}
                type="button"
                className={`appearance-palette${currentPalette === palette.name ? ' active' : ''}`}
                aria-pressed={currentPalette === palette.name}
                onClick={() => {
                  if (currentPalette === palette.name) return;
                  // Colors set by hand aren't replaced without asking; another palette's are.
                  if (currentPalette === undefined) setPendingPalette(palette.name);
                  else applyPalette(palette.name);
                }}
              >
                {/* The palette as it'd look: its background, a line of text, its accent. */}
                <span className="appearance-palette-preview" style={{ background: color('bg'), borderColor: color('border') }} aria-hidden="true">
                  <span style={{ background: color('fg') }} />
                  <span style={{ background: color('muted') }} />
                  <span className="appearance-palette-accent" style={{ background: color('accent') }} />
                </span>
                <span className="appearance-palette-name">{t.appearance.paletteNames[palette.name]}</span>
              </button>
            );
          })}
        </div>

        <ul className="appearance-colors">
          {APPEARANCE_COLORS.map((name) => {
            const color = effectiveColor(appearance, mode, name);
            const label = t.appearance.colors[name];
            const set = appearance[mode][name] !== undefined;
            return (
              <li key={name} className="appearance-color">
                <ColorMenu
                  className="appearance-swatch"
                  style={{ background: color }}
                  label={label}
                  value={color}
                  onInput={(value) => setAppearanceColor(mode, name, value)}
                />
                <span className="appearance-color-name">{label}</span>
                <code className="appearance-color-code">{color.toUpperCase()}</code>
                <button
                  type="button"
                  className="icon-button appearance-color-reset"
                  title={t.appearance.reset}
                  aria-label={`${t.appearance.reset}: ${label}`}
                  // Kept in its place, so the rows line up; only there to press once it's changed.
                  style={set ? undefined : { visibility: 'hidden' }}
                  onClick={() => setAppearanceColor(mode, name, undefined)}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="modal-actions">
          <button className="secondary" disabled={!changed} onClick={() => setConfirmReset(true)}>
            {t.appearance.resetAll}
          </button>
        </div>
      </div>

      {pendingPalette &&
        createPortal(
          <ConfirmModal
            title={t.appearance.replaceTitle}
            message={t.appearance.replaceMessage}
            confirmLabel={t.appearance.replace}
            onConfirm={() => {
              applyPalette(pendingPalette);
              setPendingPalette(null);
            }}
            onCancel={() => setPendingPalette(null)}
          />,
          document.body
        )}

      {confirmReset &&
        createPortal(
          <ConfirmModal
            title={t.appearance.resetTitle[mode]}
            message={t.appearance.resetMessage}
            confirmLabel={t.appearance.resetAll}
            onConfirm={() => {
              resetAppearance(mode);
              setConfirmReset(false);
            }}
            onCancel={() => setConfirmReset(false)}
          />,
          document.body
        )}
    </div>
  );
}
