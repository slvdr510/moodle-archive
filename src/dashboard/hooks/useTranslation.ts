import { useSyncExternalStore } from 'react';
import { getMessages, getStoredLanguage, setStoredLanguage, subscribeLanguage, type LanguagePref, type Messages } from '../../lib/i18n';

/** The current language's messages. Re-renders when the language changes. */
export function useT(): Messages {
  return useSyncExternalStore(subscribeLanguage, getMessages);
}

export function useLanguage(): [LanguagePref, (pref: LanguagePref) => void] {
  const pref = useSyncExternalStore(subscribeLanguage, getStoredLanguage);
  return [pref, (next) => void setStoredLanguage(next)];
}
