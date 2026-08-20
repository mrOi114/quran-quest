import { useEffect, useRef, useState } from 'react';

import type { AgeGroupId, ActiveLearner } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning';

import { getGameDefinition } from '../constants';
import { getQuestionsForGame } from '../content';
import { localizeGameQuestion } from '@/i18n';
import {
  pickQuestionsForRound,
  questionsPerRoundForAge,
  recordGameCompletion,
  shuffle,
  todayDateKey,
} from '../services';
import type { GameChoice, GameId, GameQuestion, GameSessionResult } from '../types';

export type FeedbackState = {
  isCorrect: boolean;
  explanation: string;
  hint?: string;
  canRetry: boolean;
};

export type GamePlayPhase = 'playing' | 'feedback' | 'complete';

function challengeKeyForDay(gameId: GameId): string {
  // One scored completion per game per calendar day — prevents XP farming.
  return `${gameId}:${todayDateKey()}`;
}

export function useGameSession(options: {
  gameId: GameId;
  learner: ActiveLearner | null;
}) {
  const { gameId, learner } = options;
  const definition = getGameDefinition(gameId);
  const ageGroup: AgeGroupId = learner ? resolveAgeGroup(learner) : 'child_7_10';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const correctCountRef = useRef(0);
  const [phase, setPhase] = useState<GamePlayPhase>('playing');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [orderDraft, setOrderDraft] = useState<GameChoice[]>([]);
  const [result, setResult] = useState<GameSessionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  function buildRound(): GameQuestion[] {
    const pool = getQuestionsForGame(gameId);
    const count = Math.min(
      definition?.questionsPerRound ?? 5,
      questionsPerRoundForAge(ageGroup),
    );
    return pickQuestionsForRound(pool, ageGroup, count).map((question) =>
      localizeGameQuestion(question, learner?.preferred_language),
    );
  }

  function seedOrderDraft(question: GameQuestion | null) {
    if (!question || question.type !== 'ordering' || !question.orderItems) {
      setOrderDraft([]);
      return;
    }
    setOrderDraft(shuffle(question.orderItems));
  }

  function resetScore() {
    correctCountRef.current = 0;
    setCorrectCount(0);
  }

  function markCorrect() {
    correctCountRef.current += 1;
    setCorrectCount(correctCountRef.current);
  }

  useEffect(() => {
    let cancelled = false;

    async function start() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      const next = buildRound();
      setQuestions(next);
      setIndex(0);
      resetScore();
      setPhase('playing');
      setFeedback(null);
      setResult(null);
      seedOrderDraft(next[0] ?? null);
      setReady(true);
    }

    void start();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild when game, age, or round changes
  }, [gameId, ageGroup, roundKey]);

  const current = questions[index] ?? null;

  function submitChoice(choiceId: string) {
    if (!current || phase !== 'playing') {
      return;
    }
    const isCorrect = current.correctChoiceId === choiceId;
    setFeedback({
      isCorrect,
      explanation: current.explanation,
      hint: current.hint,
      canRetry: !isCorrect,
    });
    if (isCorrect) {
      markCorrect();
    }
    setPhase('feedback');
  }

  function submitOrdering() {
    if (
      !current ||
      current.type !== 'ordering' ||
      !current.orderItems ||
      phase !== 'playing'
    ) {
      return;
    }
    const expected = current.orderItems.map((item) => item.id).join('|');
    const actual = orderDraft.map((item) => item.id).join('|');
    const isCorrect = expected === actual;
    setFeedback({
      isCorrect,
      explanation: current.explanation,
      hint: current.hint,
      canRetry: !isCorrect,
    });
    if (isCorrect) {
      markCorrect();
    }
    setPhase('feedback');
  }

  function moveOrderItem(fromIndex: number, direction: -1 | 1) {
    setOrderDraft((items) => {
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= items.length) {
        return items;
      }
      const next = [...items];
      const temp = next[fromIndex]!;
      next[fromIndex] = next[toIndex]!;
      next[toIndex] = temp;
      return next;
    });
  }

  function retryCurrent() {
    setFeedback(null);
    setPhase('playing');
    if (current?.type === 'ordering') {
      seedOrderDraft(current);
    }
  }

  async function finishRound(finalCorrect: number) {
    setPhase('complete');
    if (!learner) {
      return;
    }
    setIsSaving(true);
    try {
      const sessionResult = await recordGameCompletion({
        learner,
        gameId,
        challengeKey: challengeKeyForDay(gameId),
        correctCount: finalCorrect,
        totalCount: questions.length,
        ageGroup,
      });
      setResult(sessionResult);
    } finally {
      setIsSaving(false);
    }
  }

  async function continueAfterFeedback() {
    if (!feedback) {
      return;
    }

    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      await finishRound(correctCountRef.current);
      return;
    }

    setIndex(nextIndex);
    setFeedback(null);
    setPhase('playing');
    seedOrderDraft(questions[nextIndex] ?? null);
  }

  function restart() {
    setReady(false);
    setRoundKey((value) => value + 1);
  }

  return {
    definition,
    ready,
    questions,
    current,
    index,
    total: questions.length,
    correctCount,
    phase,
    feedback,
    orderDraft,
    result,
    isSaving,
    submitChoice,
    submitOrdering,
    moveOrderItem,
    retryCurrent,
    continueAfterFeedback,
    restart,
  };
}
