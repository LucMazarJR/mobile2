import * as Localization from 'expo-localization';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { readSetting, writeSetting } from '@/db/settings';
import { en } from '@/i18n/en';
import { ptBR, type Dictionary } from '@/i18n/pt-BR';

export const LANGUAGES = ['pt-BR', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<Language, string> = {
  'pt-BR': 'Português',
  en: 'English',
};

const DICTIONARIES: Record<Language, Dictionary> = { 'pt-BR': ptBR, en };

const SETTING_KEY = 'language';

// The phone's language decides the first run; after that the user's own choice
// wins and is remembered locally.
function deviceLanguage(): Language {
  const tag = Localization.getLocales()[0]?.languageCode ?? 'pt';
  return tag.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

type I18nValue = {
  t: Dictionary;
  language: Language;
  setLanguage: (language: Language) => void;
  /** BCP 47 tag for Intl / toLocaleDateString. */
  locale: string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [language, setLanguageState] = useState<Language>(deviceLanguage);

  useEffect(() => {
    readSetting(db, SETTING_KEY)
      .then((saved) => {
        if (saved === 'pt-BR' || saved === 'en') setLanguageState(saved);
      })
      .catch(() => {
        // Falls back to the phone's language, which is already set.
      });
  }, [db]);

  const setLanguage = useCallback(
    (next: Language) => {
      setLanguageState(next);
      writeSetting(db, SETTING_KEY, next).catch((erro) => {
        console.warn('[settings] could not persist language', erro);
      });
    },
    [db]
  );

  return (
    <I18nContext.Provider
      value={{
        t: DICTIONARIES[language],
        language,
        setLanguage,
        locale: language === 'pt-BR' ? 'pt-BR' : 'en-US',
      }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
