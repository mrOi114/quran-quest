import type { UiLanguage } from '@/i18n';

import type { CompetitionQuestionView } from '../types';

export function localizeCompetitionQuestion(
  question: CompetitionQuestionView,
  language: UiLanguage,
) {
  const prompt =
    language === 'ar'
      ? question.prompt_ar || question.prompt_en
      : language === 'so'
        ? question.prompt_so
        : question.prompt_en;

  return {
    prompt,
    promptArabic: question.prompt_arabic?.trim() ? question.prompt_arabic : null,
    kind: question.kind,
    choices: question.choices.map((choice) => {
      const arabic = Boolean(choice.is_arabic);
      const label =
        arabic
          ? choice.label_ar || choice.label_en
          : language === 'ar'
            ? choice.label_ar || choice.label_en
            : language === 'so'
              ? choice.label_so
              : choice.label_en;
      return {
        id: choice.id,
        letter: choice.id.toUpperCase(),
        label,
        isArabic: arabic || (language === 'ar' && Boolean(choice.label_ar)),
      };
    }),
  };
}

export function formatCompetitionTimer(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
