import { en, type Messages } from './locales/en';

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

/** Every other language is its own chunk, fetched only when it's the one in use, so a
 *  page doesn't download and parse all of them just to show one (the popup has to open
 *  fast). The background and the content script use ./locales/index.ts instead. */
const LOCALE_LOADERS = import.meta.glob<Record<string, Messages>>([
  './locales/*.ts',
  '!./locales/en.ts',
  '!./locales/index.ts'
]);

const loaded = new Map<Locale, Messages>([['en', en]]);

async function loadLocale(locale: Locale): Promise<void> {
  if (loaded.has(locale)) return;
  const module = await LOCALE_LOADERS[`./locales/${locale}.ts`]();
  loaded.set(locale, module[locale]);
}

/** Locales written right to left; the pages flip their layout for these. */
const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar', 'arz', 'ur']);

export const STORAGE_KEY = 'moodle-archive-language';

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && Object.hasOwn(LOCALE_NAMES, value);
}

export function isLanguagePref(value: unknown): value is LanguagePref {
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

/** Resolves once the new language's messages are loaded and everything subscribed to
 *  the language has been told about it. */
export async function setStoredLanguage(pref: LanguagePref): Promise<void> {
  localStorage.setItem(STORAGE_KEY, pref);
  // Mirrored to chrome.storage, the only place the content script (which runs with the
  // Moodle page's localStorage) and the background can read it from.
  try {
    void Promise.resolve(globalThis.chrome?.storage?.local?.set({ [STORAGE_KEY]: pref })).catch(() => {});
  } catch {
    // Not running as an extension (e.g. tests) — nothing else needs it then.
  }
  applyDocumentLanguage();
  await loadLocale(resolveLocale(pref));
  listeners.forEach((listener) => listener());
}

/** Lets every component re-render together when the language changes. */
export function subscribeLanguage(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Loads the current language's messages; an extension page awaits this once before
 *  it first renders, so getMessages() has them from then on. */
export function ensureMessages(): Promise<void> {
  return loadLocale(resolveLocale(getStoredLanguage()));
}

/** The messages for the current language, for code that runs in an extension page.
 *  English until ensureMessages() has loaded the language in use. */
export function getMessages(): Messages {
  return loaded.get(resolveLocale(getStoredLanguage())) ?? en;
}

/** Keeps `<html lang>` in step, so spellcheck, hyphenation and screen readers match,
 *  and `<html dir>` so right-to-left languages lay out mirrored. */
export function applyDocumentLanguage(): void {
  const locale = resolveLocale(getStoredLanguage());
  // "zh-Hans" rather than "zh", so the browser picks Simplified Chinese glyphs.
  document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}
