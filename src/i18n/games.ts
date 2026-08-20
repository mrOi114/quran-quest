import type { GameAchievementId, GameDefinition, GameQuestion } from '@/features/games/types';

import type { MessageKey } from './en';
import { GAME_QUESTION_SO } from './gameQuestions.so';
import { t } from './translate';

export type LocalizedGameQuestion = GameQuestion;

export function localizeGameDefinition(
  game: GameDefinition,
  language: string | null | undefined,
): GameDefinition {
  return {
    ...game,
    title: t(`game.${game.id}.title` as MessageKey, language),
    subtitle: t(`game.${game.id}.subtitle` as MessageKey, language),
  };
}

export function localizeAchievement(
  id: GameAchievementId,
  language: string | null | undefined,
): { title: string; description: string } {
  return {
    title: t(`achieve.${id}.title` as MessageKey, language),
    description: t(`achieve.${id}.description` as MessageKey, language),
  };
}

export function localizeGameQuestion(
  question: GameQuestion,
  language: string | null | undefined,
): LocalizedGameQuestion {
  const code = (language ?? 'en').trim().toLowerCase();
  if (code !== 'so' && !code.startsWith('so-')) {
    return question;
  }
  const overlay = GAME_QUESTION_SO[question.id];
  if (!overlay) {
    return question;
  }

  return {
    ...question,
    prompt: overlay.prompt,
    clue: overlay.clue ?? question.clue,
    explanation: overlay.explanation,
    hint: overlay.hint ?? question.hint,
    answerLabel: overlay.answerLabel ?? question.answerLabel,
    choices: question.choices?.map((choice) => ({
      ...choice,
      label: overlay.choices?.[choice.id] ?? choice.label,
    })),
    orderItems: question.orderItems?.map((item) => ({
      ...item,
      label: overlay.orderItems?.[item.id] ?? item.label,
    })),
  };
}

