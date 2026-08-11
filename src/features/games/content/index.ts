import type { GameId, GameQuestion } from '../types';
import { CHARACTER_QUESTIONS } from './character';
import { KNOWLEDGE_QUESTIONS } from './knowledge';
import { PROPHETS_QUESTIONS } from './prophets';
import { SALAH_QUESTIONS } from './salah';
import { WUDU_QUESTIONS } from './wudu';

const ALL_QUESTIONS: GameQuestion[] = [
  ...WUDU_QUESTIONS,
  ...SALAH_QUESTIONS,
  ...PROPHETS_QUESTIONS,
  ...CHARACTER_QUESTIONS,
  ...KNOWLEDGE_QUESTIONS,
];

export function getQuestionsForGame(gameId: GameId): GameQuestion[] {
  return ALL_QUESTIONS.filter((question) => question.gameId === gameId);
}

export function getAllGameQuestions(): GameQuestion[] {
  return ALL_QUESTIONS;
}
