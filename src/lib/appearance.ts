/**
 * The interface's own colors, as the user sets them (see AppearanceModal): each of
 * those styles.css takes from its variables, for the light theme and the dark one
 * apart. Only what's been changed is kept, in this browser like the other settings
 * (not in backups); the rest stays styles.css's own.
 *
 * Applied over styles.css by a <style> of its own (see applyAppearance), on every
 * page that has the dashboard's look: the dashboard and the popup.
 */

export const APPEARANCE_COLORS = ['bg', 'surface', 'fg', 'muted', 'border', 'accent', 'focus', 'new', 'modified', 'deleted', 'unchanged'] as const;

export type AppearanceColor = (typeof APPEARANCE_COLORS)[number];
export type AppearanceMode = 'light' | 'dark';
export type AppearanceColors = Partial<Record<AppearanceColor, string>>;
export type Appearance = Record<AppearanceMode, AppearanceColors>;

/** styles.css's own. The keyboard's focus has none of its own: it's the text's. */
export const DEFAULT_COLORS: Record<AppearanceMode, Record<Exclude<AppearanceColor, 'focus'>, string>> = {
  light: {
    bg: '#ffffff',
    surface: '#f8f9fb',
    fg: '#16181d',
    muted: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    new: '#16a34a',
    modified: '#d97706',
    deleted: '#dc2626',
    unchanged: '#6b7280'
  },
  dark: {
    bg: '#0f1115',
    surface: '#171a20',
    fg: '#e9eaee',
    muted: '#9ca3af',
    border: '#2a2d34',
    accent: '#2563eb',
    new: '#16a34a',
    modified: '#d97706',
    deleted: '#dc2626',
    unchanged: '#6b7280'
  }
};

const STORAGE_KEY = 'moodle-archive-appearance';
const STYLE_ID = 'moodle-archive-appearance';
const HEX = /^#[0-9a-f]{6}$/;

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: Appearance = { light: {}, dark: {} };

function valid(colors: unknown): AppearanceColors {
  const out: AppearanceColors = {};
  if (!colors || typeof colors !== 'object') return out;
  for (const name of APPEARANCE_COLORS) {
    const value = (colors as Record<string, unknown>)[name];
    if (typeof value === 'string' && HEX.test(value.toLowerCase())) out[name] = value.toLowerCase();
  }
  return out;
}

/** What's been changed, theme by theme. The same object until it changes again. */
export function getAppearance(): Appearance {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: none changed.
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : undefined;
  } catch {
    parsed = undefined;
  }
  const stored = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  cached = { light: valid(stored.light), dark: valid(stored.dark) };
  return cached;
}

function save(next: Appearance): void {
  const empty = Object.keys(next.light).length === 0 && Object.keys(next.dark).length === 0;
  if (empty) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

/** `color` set for `name` in `mode`; undefined takes it back to styles.css's own. */
export function setAppearanceColor(mode: AppearanceMode, name: AppearanceColor, color: string | undefined): void {
  const current = getAppearance();
  const colors = { ...current[mode] };
  if (color === undefined) delete colors[name];
  else colors[name] = color.toLowerCase();
  save({ ...current, [mode]: colors });
}

/** Every color of `mode` back to styles.css's own. */
export function resetAppearance(mode: AppearanceMode): void {
  save({ ...getAppearance(), [mode]: {} });
}

export function subscribeAppearance(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** All of `mode`'s colors as `colors`, those it doesn't have back to styles.css's own
 *  (a palette chosen). */
export function setAppearanceColors(mode: AppearanceMode, colors: AppearanceColors): void {
  save({ ...getAppearance(), [mode]: valid(colors) });
}

export type PaletteName = 'default' | 'ocean' | 'forest' | 'lavender' | 'warm' | 'contrast';

/**
 * Palettes to start from, each with a light version and a dark one: the colors they
 * change, the rest left as styles.css has them (the default one changes none). Their
 * accent can be light (the dark versions'): the text on it turns dark (see textOn).
 */
export const PALETTES: { name: PaletteName; colors: Appearance }[] = [
  { name: 'default', colors: { light: {}, dark: {} } },
  {
    name: 'ocean',
    colors: {
      light: { bg: '#f5f9fc', surface: '#e8f1f7', fg: '#0f2537', muted: '#587085', border: '#d2e1ec', accent: '#0e7490' },
      dark: { bg: '#0b1220', surface: '#111b2e', fg: '#e2e8f0', muted: '#94a3b8', border: '#1f2b40', accent: '#38bdf8' }
    }
  },
  {
    name: 'forest',
    colors: {
      light: { bg: '#f7faf5', surface: '#ecf2e7', fg: '#1b2a1a', muted: '#5c6d57', border: '#d9e4d1', accent: '#3f7d3a' },
      dark: { bg: '#0e1410', surface: '#151e17', fg: '#e3ebe0', muted: '#9aab95', border: '#263129', accent: '#4ade80' }
    }
  },
  {
    name: 'lavender',
    colors: {
      light: { bg: '#faf8fe', surface: '#f1edfa', fg: '#231a33', muted: '#6b6083', border: '#e2daf2', accent: '#7c3aed' },
      dark: { bg: '#15111f', surface: '#1d1730', fg: '#ece6f7', muted: '#a89dc0', border: '#2e2645', accent: '#a78bfa' }
    }
  },
  {
    name: 'warm',
    colors: {
      light: { bg: '#fbf6ec', surface: '#f3e9d6', fg: '#3b2f22', muted: '#76664f', border: '#e5d7bf', accent: '#b45309' },
      dark: { bg: '#15110e', surface: '#1d1814', fg: '#efe6dc', muted: '#a8998a', border: '#2f2721', accent: '#f59e0b' }
    }
  },
  {
    name: 'contrast',
    colors: {
      light: {
        bg: '#ffffff',
        surface: '#eeeeee',
        fg: '#000000',
        muted: '#3a3a3a',
        border: '#000000',
        accent: '#0033cc',
        new: '#006b1f',
        modified: '#8a4b00',
        deleted: '#b00020',
        unchanged: '#3a3a3a'
      },
      dark: {
        bg: '#000000',
        surface: '#141414',
        fg: '#ffffff',
        muted: '#d0d0d0',
        border: '#ffffff',
        accent: '#4da3ff',
        new: '#3ddc84',
        modified: '#ffb020',
        deleted: '#ff6b6b',
        unchanged: '#c0c0c0'
      }
    }
  }
];

function sameColors(a: AppearanceColors, b: AppearanceColors): boolean {
  return APPEARANCE_COLORS.every((name) => a[name] === b[name]);
}

/** The palette `mode`'s colors are, as it has them; undefined once any's been changed. */
export function paletteOf(appearance: Appearance, mode: AppearanceMode): PaletteName | undefined {
  return PALETTES.find((palette) => sameColors(palette.colors[mode], appearance[mode]))?.name;
}

/** What `name` shows as in `mode`: as set, or styles.css's own — the focus, the text's. */
export function effectiveColor(appearance: Appearance, mode: AppearanceMode, name: AppearanceColor): string {
  const set = appearance[mode][name];
  if (set) return set;
  return name === 'focus' ? effectiveColor(appearance, mode, 'fg') : DEFAULT_COLORS[mode][name];
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** The text to write on `hex`: white, as on styles.css's own colors, unless it's too
 *  light for it to read — then nearly black. */
export function textOn(hex: string): string {
  return 1.05 / (luminance(hex) + 0.05) >= 3 ? '#ffffff' : '#111111';
}

/** The CSS variables for what's set in `colors`, and those that follow from them: a
 *  button's hover from its color, the text on each color that has some on it. */
function declarations(colors: AppearanceColors): string {
  const lines: string[] = [];
  for (const name of APPEARANCE_COLORS) {
    const color = colors[name];
    if (!color) continue;
    lines.push(`--${name}: ${color};`);
    if (name === 'accent') lines.push(`--accent-hover: color-mix(in srgb, ${color} 85%, black);`);
    if (name !== 'bg' && name !== 'surface' && name !== 'fg' && name !== 'muted' && name !== 'border' && name !== 'focus') {
      lines.push(`--on-${name}: ${textOn(color)};`);
    }
  }
  return lines.join(' ');
}

/** The stylesheet for `appearance`: each theme's, under the same conditions as
 *  styles.css's (chosen, or the system's), and over it (:root:root). */
export function appearanceCss(appearance: Appearance): string {
  const light = declarations(appearance.light);
  const dark = declarations(appearance.dark);
  const rules: string[] = [];
  if (light) {
    rules.push(`:root:root[data-theme='light'] { ${light} }`);
    rules.push(`@media (prefers-color-scheme: light) { :root:root:not([data-theme='dark']) { ${light} } }`);
  }
  if (dark) {
    rules.push(`:root:root[data-theme='dark'] { ${dark} }`);
    rules.push(`@media (prefers-color-scheme: dark) { :root:root:not([data-theme='light']) { ${dark} } }`);
  }
  return rules.join('\n');
}

function apply(): void {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = appearanceCss(getAppearance());
}

/**
 * Applies the colors set, and again whenever they change: here, or on another of the
 * extension's pages (another dashboard tab).
 */
export function applyAppearance(): void {
  apply();
  subscribeAppearance(apply);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) apply();
  });
}

/** The theme showing now: the one chosen, or the system's. */
export function shownMode(): AppearanceMode {
  const chosen = document.documentElement.getAttribute('data-theme');
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
