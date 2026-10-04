// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageSelector } from '../src/dashboard/components/LanguageSelector';
import { RecentSettingsModal } from '../src/dashboard/components/RecentSettingsModal';
import { LOCALES, getMessages, getStoredLanguage, loadMessages, resolveLocale, setStoredLanguage } from '../src/lib/i18n';
import { en } from '../src/lib/locales/en';
import { es } from '../src/lib/locales/es';
import { formatRelativeTime } from '../src/lib/relativeTime';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

/** Every key path in a messages object, e.g. "courses.deleteAll". */
function keyPaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null ? keyPaths(child, `${prefix}${key}.`) : [`${prefix}${key}`]
  );
}

describe('i18n', () => {
  it('follows the browser language by default, falling back to English', () => {
    expect(getStoredLanguage()).toBe('auto');
    expect(resolveLocale('auto', 'es-ES')).toBe('es');
    expect(resolveLocale('auto', 'es-419')).toBe('es');
    expect(resolveLocale('auto', 'fr-FR')).toBe('fr');
    expect(resolveLocale('auto', 'pt-BR')).toBe('pt');
    expect(resolveLocale('auto', 'zh-TW')).toBe('zh');
    expect(resolveLocale('auto', 'ar-EG')).toBe('ar');
    expect(resolveLocale('auto', 'arz')).toBe('arz');
    expect(resolveLocale('auto', 'in-ID')).toBe('id');
    expect(resolveLocale('auto', 'nl-NL')).toBe('en');
    expect(resolveLocale('auto', 'en-US')).toBe('en');
  });

  it('lays right-to-left languages out mirrored', () => {
    setStoredLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    setStoredLanguage('ur');
    expect(document.documentElement.dir).toBe('rtl');
    setStoredLanguage('ja');
    expect(document.documentElement.dir).toBe('ltr');
    setStoredLanguage('zh');
    expect(document.documentElement.lang).toBe('zh-Hans');
  });

  it('an explicit choice overrides the browser language', () => {
    expect(resolveLocale('en', 'es-ES')).toBe('en');
    setStoredLanguage('es');
    expect(getStoredLanguage()).toBe('es');
    expect(getMessages()).toBe(es);
    expect(document.documentElement.lang).toBe('es');
  });

  it('falls back to auto for a garbage stored value', () => {
    localStorage.setItem('moodle-archive-language', 'klingon');
    expect(getStoredLanguage()).toBe('auto');
  });

  it('mirrors the choice to chrome.storage, where the content script reads it', async () => {
    const store: Record<string, unknown> = {};
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          set: vi.fn(async (items: Record<string, unknown>) => Object.assign(store, items)),
          get: vi.fn(async (key: string) => ({ [key]: store[key] }))
        }
      }
    });
    setStoredLanguage('es');
    await Promise.resolve();
    expect(await loadMessages()).toBe(es);
  });

  it('every language has exactly the same keys as English', () => {
    for (const messages of Object.values(LOCALES)) {
      expect(keyPaths(messages).sort()).toEqual(keyPaths(en).sort());
    }
  });

  it('formats relative times in the given language', () => {
    const now = new Date(2026, 0, 15).getTime();
    expect(formatRelativeTime(now - 3 * 24 * 3_600_000, now, es)).toBe('hace 3 d');
    expect(formatRelativeTime(now, now, es)).toBe('ahora mismo');
  });

  it('switching the language re-renders what is on screen', async () => {
    render(
      <>
        <LanguageSelector />
        <RecentSettingsModal onClose={() => {}} />
      </>
    );
    expect(screen.getByText('Applies to every course.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Language' }));
    await userEvent.click(screen.getByRole('option', { name: 'Español' }));

    expect(screen.getByText('Se aplica a todos los cursos.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Idioma' })).toHaveTextContent('ES');
  });
});
