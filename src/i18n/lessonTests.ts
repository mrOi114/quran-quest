import type { LessonTestQuestion } from '@/features/learning/types';

import { t } from './translate';

export function localizeLessonTestQuestion(
  question: LessonTestQuestion,
  language: string | null | undefined,
): LessonTestQuestion {
  switch (question.kind) {
    case 'meaning':
      return { ...question, prompt: t('test.meaningPrompt', language) };
    case 'identify': {
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
    case 'next':
      return { ...question, prompt: t('test.nextPrompt', language) };
    case 'before':
      return { ...question, prompt: t('test.beforePrompt', language) };
    case 'missing':
      return { ...question, prompt: t('test.missingPrompt', language) };
    case 'listen':
      return { ...question, prompt: t('test.listenPrompt', language) };
    case 'match':
      return { ...question, prompt: t('test.matchPrompt', language) };
    case 'surah':
      return { ...question, prompt: t('test.surahPrompt', language) };
    default:
      return question;
  }
}
