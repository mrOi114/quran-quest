import { useCallback, useMemo } from 'react';

import { useAuth } from '@/features/auth';

import {
  normalizeUiLanguage,
  t,
  translateAyahRange,
  translateLessonLabel,
  type MessageKey,
  type TranslateVars,
  type UiLanguage,
} from './translate';

export function useI18n(languageOverride?: string | null) {
  const { activeLearner, profile, guestProfile } = useAuth();
  const language: UiLanguage = useMemo(() => {
    if (languageOverride) {
      return normalizeUiLanguage(languageOverride);
    }
    return normalizeUiLanguage(
      activeLearner?.preferred_language ??
        guestProfile?.preferredLanguage ??
        profile?.preferred_language ??
        'en',
    );
  }, [
    activeLearner?.preferred_language,
    guestProfile?.preferredLanguage,
    languageOverride,
    profile?.preferred_language,
  ]);

  const translate = useCallback(
    (key: MessageKey, vars?: TranslateVars) => t(key, language, vars),
    [language],
  );

  return {
    language,
    isSomali: language === 'so',
    t: translate,
    lessonLabel: (index: number) => translateLessonLabel(index, language),
    ayahRange: (start: number, end: number) => translateAyahRange(start, end, language),
  };
}
