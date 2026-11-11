// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { appearanceCss, effectiveColor, getAppearance, paletteOf, PALETTES, resetAppearance, setAppearanceColor, setAppearanceColors, textOn } from '../src/lib/appearance';

beforeEach(() => localStorage.clear());

describe('appearance', () => {
  it("keeps only what's changed, each theme apart, and takes it back", () => {
    expect(getAppearance()).toEqual({ light: {}, dark: {} });
    setAppearanceColor('dark', 'accent', '#FF8800');
    setAppearanceColor('light', 'bg', '#fafafa');
    expect(getAppearance()).toEqual({ light: { bg: '#fafafa' }, dark: { accent: '#ff8800' } });
    setAppearanceColor('dark', 'accent', undefined);
    expect(getAppearance().dark).toEqual({});
    resetAppearance('light');
    // Nothing changed left: nothing stored.
    expect(localStorage.getItem('moodle-archive-appearance')).toBeNull();
  });

  it("ignores what isn't a color", () => {
    localStorage.setItem('moodle-archive-appearance', JSON.stringify({ light: { bg: 'red', fg: '#123456', nope: '#000000' }, dark: 3 }));
    expect(getAppearance()).toEqual({ light: { fg: '#123456' }, dark: {} });
  });

  it("shows each color as set, or as styles.css has it; the focus as the text's", () => {
    setAppearanceColor('light', 'fg', '#330000');
    const appearance = getAppearance();
    expect(effectiveColor(appearance, 'light', 'fg')).toBe('#330000');
    expect(effectiveColor(appearance, 'light', 'focus')).toBe('#330000');
    expect(effectiveColor(appearance, 'dark', 'focus')).toBe('#e9eaee');
    expect(effectiveColor(appearance, 'dark', 'bg')).toBe('#0f1115');
  });

  it('writes white on a color dark enough for it, nearly black on a light one', () => {
    expect(textOn('#2563eb')).toBe('#ffffff');
    expect(textOn('#16a34a')).toBe('#ffffff');
    expect(textOn('#ffe066')).toBe('#111111');
  });

  it('puts each theme under the same conditions as styles.css, over it, with what follows from it', () => {
    setAppearanceColor('dark', 'accent', '#ffe066');
    const css = appearanceCss(getAppearance());
    expect(css).toContain(":root:root[data-theme='dark'] { --accent: #ffe066; --accent-hover: color-mix(in srgb, #ffe066 85%, black); --on-accent: #111111; }");
    expect(css).toContain("@media (prefers-color-scheme: dark) { :root:root:not([data-theme='light'])");
    expect(css).not.toContain("data-theme='light'] {");
  });

  it('tells which palette a theme is, until a color of it is changed', () => {
    expect(paletteOf(getAppearance(), 'light')).toBe('default');
    setAppearanceColors('dark', PALETTES.find((p) => p.name === 'warm')!.colors.dark);
    expect(paletteOf(getAppearance(), 'dark')).toBe('warm');
    setAppearanceColor('dark', 'border', '#000000');
    expect(paletteOf(getAppearance(), 'dark')).toBeUndefined();
  });

  it("gives every palette's text and buttons enough contrast to read", () => {
    const contrast = (a: string, b: string) => {
      const l = (hex: string) => {
        const c = (i: number) => {
          const v = parseInt(hex.slice(i, i + 2), 16) / 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * c(1) + 0.7152 * c(3) + 0.0722 * c(5);
      };
      const [x, y] = [l(a), l(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    for (const palette of PALETTES) {
      for (const mode of ['light', 'dark'] as const) {
        const colors = { light: {}, dark: {}, [mode]: palette.colors[mode] };
        const c = (name: Parameters<typeof effectiveColor>[2]) => effectiveColor(colors, mode, name);
        expect(contrast(c('fg'), c('bg')), `${palette.name} ${mode} text`).toBeGreaterThanOrEqual(7);
        expect(contrast(c('muted'), c('bg')), `${palette.name} ${mode} secondary text`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(textOn(c('accent')), c('accent')), `${palette.name} ${mode} button`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
