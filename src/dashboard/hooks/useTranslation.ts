import { useSyncExternalStore } from 'react';
import { LOCALES, getStoredLanguage, resolveLocale, setStoredLanguage, subscribeLanguage, type LanguagePref, type Messages } from '../../lib/i18n';

/** The current language's messages. Re-renders when the language changes. */
export function useT(): Messages {
  return LOCALES[resolveLocale(useLanguage()[0])];
}

export function useLanguage(): [LanguagePref, (pref: LanguagePref) => void] {
  const pref = useSyncExternalStore(subscribeLanguage, getStoredLanguage);
  return [pref, setStoredLanguage];
}
