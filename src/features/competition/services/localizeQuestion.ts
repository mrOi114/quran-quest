import type { UiLanguage } from '@/i18n';

import type { CompetitionQuestionView } from '../types';

export function localizeCompetitionQuestion(
  question: CompetitionQuestionView,
  language: UiLanguage,
) {
  const somali = language === 'so';
  return {
    prompt: somali ? question.prompt_so : question.prompt_en,
    choices: question.choices.map((choice) => ({
      id: choice.id,
      letter: choice.id.toUpperCase(),
      label: somali ? choice.label_so : choice.label_en,
    })),
  };
}

export function formatCompetitionTimer(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
