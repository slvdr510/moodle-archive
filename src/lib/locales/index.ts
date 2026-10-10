import { STORAGE_KEY, isLanguagePref, resolveLocale, type Locale } from '../i18n';
import { ar } from './ar';
import { arz } from './arz';
import { bn } from './bn';
import { de } from './de';
import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';
import { ha } from './ha';
import { hi } from './hi';
import { id } from './id';
import { it } from './it';
import { ja } from './ja';
import { mr } from './mr';
import { pcm } from './pcm';
import { pt } from './pt';
import { ru } from './ru';
import { sw } from './sw';
import { te } from './te';
import { ur } from './ur';
import { vi } from './vi';
import { zh } from './zh';

/** Every language, bundled up front. For the background and the content script, which
 *  can't fetch chunks on demand (a service worker disallows import(), and the content
 *  script is one self-contained file) — extension pages use ../i18n.ts's lazy loading. */
export const LOCALES: Record<Locale, Messages> = {
  en, es, zh, hi, ar, arz, fr, it, bn, pt, id, ur, ru, de, ja, pcm, mr, vi, te, sw, ha
};

/** The messages for the current language, for the content script and the background. */
export async function loadMessages(): Promise<Messages> {
  try {
    const stored = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
    return LOCALES[resolveLocale(isLanguagePref(stored) ? stored : 'auto')];
  } catch {
    return LOCALES[resolveLocale('auto')];
  }
}
