import { getVerse, getVersesForSurah } from '@/features/learning/content';
import {
  capBandByAge,
  isUnderEight,
  resolveAbilityBand,
  type AbilityBand,
} from '@/features/learning/services/lessonAbility';
import type { LearningSnapshot } from '@/features/learning/types';
import { resolveVerseMeaning } from '@/features/reader/services/translationResolver';

export type UnderstandingChoice = {
  id: string;
  label: string;
};

export type UnderstandingQuestion = {
  id: string;
  prompt: string;
  choices: UnderstandingChoice[];
  correctChoiceId: string;
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    next[i] = swap;
    next[j] = current;
  }
  return next;
}

function clipMeaning(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max).trim()}…`;
}

function publishedMeaning(
  verseId: string,
  language: string,
): string | null {
  const resolved = resolveVerseMeaning(verseId, language);
  const text = resolved?.text?.trim();
  return text ? text : null;
}

/**
 * Understanding questions use only already-approved lesson meaning text.
 * They never invent tafsir or new religious claims.
 */
export function buildUnderstandingQuestion(
  verseId: string,
  language: string,
  snapshot: LearningSnapshot,
  ageYears: number,
): UnderstandingQuestion | null {
  const verse = getVerse(verseId);
  const correct = publishedMeaning(verseId, language);
  if (!verse || !correct) {
    return null;
  }

  const band: AbilityBand = capBandByAge(resolveAbilityBand(snapshot), ageYears);
  const sameSurah = getVersesForSurah(verse.surahNumber).filter((item) => item.id !== verse.id);
  const wrongTexts = sameSurah
    .map((item) => publishedMeaning(item.id, language))
    .filter((text): text is string => Boolean(text) && text !== correct)
    .slice(0, 6);

  if (wrongTexts.length < 1) {
    return null;
  }

  const simple = isUnderEight(ageYears) || band === 'beginner';
  const advanced = !isUnderEight(ageYears) && (band === 'strong' || band === 'excellent');
  const maxLen = simple ? 72 : advanced ? 220 : 140;
  const needed = simple ? 1 : 2;
  const wrong = shuffle(wrongTexts)
    .slice(0, needed)
    .map((text) => clipMeaning(text, maxLen));
  const correctLabel = clipMeaning(correct, maxLen);

  const choices = shuffle([
    { id: `${verseId}-ok`, label: correctLabel },
    ...wrong.map((label, index) => ({ id: `${verseId}-w${index}`, label })),
  ]);
  const correctChoice = choices.find((choice) => choice.label === correctLabel);
  if (!correctChoice) {
    return null;
  }

  return {
    id: `${verseId}-understand`,
    prompt: 'whatDidWeLearn',
    choices,
    correctChoiceId: correctChoice.id,
  };
}
