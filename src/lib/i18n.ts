import { ar } from './locales/ar';
import { arz } from './locales/arz';
import { bn } from './locales/bn';
import { de } from './locales/de';
import { en, type Messages } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ha } from './locales/ha';
import { hi } from './locales/hi';
import { id } from './locales/id';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { mr } from './locales/mr';
import { pcm } from './locales/pcm';
import { pt } from './locales/pt';
import { ru } from './locales/ru';
import { sw } from './locales/sw';
import { te } from './locales/te';
import { ur } from './locales/ur';
import { vi } from './locales/vi';
import { zh } from './locales/zh';

export type { Messages };

/** Each language's name in itself, so it's recognizable whatever language is active.
 *  The keys are BCP 47 primary language subtags, and the order is the menu's order. */
export const LOCALE_NAMES = {
  en: 'English',
  es: 'Español',
  zh: '中文（简体）',
  hi: 'हिन्दी',
  ar: 'العربية',
  arz: 'العربية المصرية',
  fr: 'Français',
  it: 'Italiano',
  bn: 'বাংলা',
  pt: 'Português',
  id: 'Bahasa Indonesia',
  ur: 'اردو',
  ru: 'Русский',
  de: 'Deutsch',
  ja: '日本語',
  pcm: 'Naijá',
  mr: 'मराठी',
  vi: 'Tiếng Việt',
  te: 'తెలుగు',
  sw: 'Kiswahili',
  ha: 'Hausa'
} as const;

export type Locale = keyof typeof LOCALE_NAMES;
/** 'auto' follows the browser's language, falling back to English. */
export type LanguagePref = 'auto' | Locale;

export const LOCALES: Record<Locale, Messages> = {
  en, es, zh, hi, ar, arz, fr, it, bn, pt, id, ur, ru, de, ja, pcm, mr, vi, te, sw, ha
};

/** Locales written right to left; the pages flip their layout for these. */
const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar', 'arz', 'ur']);

const STORAGE_KEY = 'moodle-archive-language';

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && Object.hasOwn(LOCALE_NAMES, value);
}

function isLanguagePref(value: unknown): value is LanguagePref {
  return value === 'auto' || isLocale(value);
}

export function resolveLocale(pref: LanguagePref, browserLanguage: string = navigator.language): Locale {
  if (pref !== 'auto') return pref;
  // Matched on the primary subtag, so "pt-BR" and "pt-PT" both get Portuguese and
  // "zh-TW" gets (Simplified) Chinese rather than English. "in" is Indonesian's old code.
  const primary = browserLanguage.toLowerCase().split(/[-_]/)[0];
  if (primary === 'in') return 'id';
  return isLocale(primary) ? primary : 'en';
}

/** The extension pages (dashboard, popup, viewer) share localStorage, so they read the
 *  preference synchronously from there. A service worker has no localStorage at all. */
export function getStoredLanguage(): LanguagePref {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguagePref(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function setStoredLanguage(pref: LanguagePref): void {
  localStorage.setItem(STORAGE_KEY, pref);
  // Mirrored to chrome.storage, the only place the content script (which runs with the
  // Moodle page's localStorage) and the background can read it from.
  try {
    void Promise.resolve(globalThis.chrome?.storage?.local?.set({ [STORAGE_KEY]: pref })).catch(() => {});
  } catch {
    // Not running as an extension (e.g. tests) — nothing else needs it then.
  }
  applyDocumentLanguage();
  listeners.forEach((listener) => listener());
}

/** Lets every component re-render together when the language changes. */
export function subscribeLanguage(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The messages for the current language, for code that runs in an extension page. */
export function getMessages(): Messages {
  return LOCALES[resolveLocale(getStoredLanguage())];
}

/** The messages for the current language, for the content script and the background. */
export async function loadMessages(): Promise<Messages> {
  try {
    const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
    return LOCALES[resolveLocale(isLanguagePref(stored) ? stored : 'auto')];
  } catch {
    return LOCALES[resolveLocale('auto')];
  }
}

/** Keeps `<html lang>` in step, so spellcheck, hyphenation and screen readers match,
 *  and `<html dir>` so right-to-left languages lay out mirrored. */
export function applyDocumentLanguage(): void {
  const locale = resolveLocale(getStoredLanguage());
  // "zh-Hans" rather than "zh", so the browser picks Simplified Chinese glyphs.
  document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}
