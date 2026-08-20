import type { LessonTestQuestion } from '@/features/learning/types';

import { t } from './translate';

export function localizeLessonTestQuestion(
  question: LessonTestQuestion,
  language: string | null | undefined,
): LessonTestQuestion {
  if (question.id.endsWith('-meaning')) {
    return { ...question, prompt: t('test.meaningPrompt', language) };
  }
  if (question.id.endsWith('-identify')) {
    const meaning = question.prompt.includes('\n')
      ? question.prompt.split('\n').slice(1).join('\n')
      : '';
    return {
      ...question,
      prompt: meaning
        ? `${t('test.identifyPrompt', language)}\n${meaning}`
        : t('test.identifyPrompt', language),
    };
  }
  if (question.id.endsWith('-next')) {
    return { ...question, prompt: t('test.nextPrompt', language) };
  }
  if (question.id.endsWith('-surah')) {
    return { ...question, prompt: t('test.surahPrompt', language) };
  }
  return question;
}
