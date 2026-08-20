import { useEffect, useMemo, useRef, useState } from 'react';

import { localizeQuestion, shuffle } from '../services/localize';
import type { QisasLanguage, QisasQuestion } from '../types';

export type QisasQuizFeedback = {
  isCorrect: boolean;
  explanation: string;
  hint?: string;
};

export type QisasQuizPhase = 'playing' | 'feedback' | 'complete';

type UseQisasQuizOptions = {
  onComplete?: (correctCount: number, total: number) => void;
};

export function useQisasQuiz(
  questions: QisasQuestion[],
  language: QisasLanguage,
  options: UseQisasQuizOptions = {},
) {
  const onCompleteRef = useRef(options.onComplete);
  onCompleteRef.current = options.onComplete;
  const localized = useMemo(
    () => questions.map((question) => localizeQuestion(question, language)),
    [language, questions],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<QisasQuizPhase>('playing');
  const [feedback, setFeedback] = useState<QisasQuizFeedback | null>(null);
  const [orderDraft, setOrderDraft] = useState<{ id: string; label: string }[]>(
    () => {
      const first = localized[0];
      return first?.orderItems ? shuffle(first.orderItems) : [];
    },
  );

  const current = localized[index] ?? null;
  const total = localized.length;

  function startOrder(nextIndex: number) {
    const next = localized[nextIndex];
    setOrderDraft(next?.orderItems ? shuffle(next.orderItems) : []);
  }

  function submitChoice(choiceId: string) {
    if (!current?.correctChoiceId || phase !== 'playing') {
      return;
    }
    const isCorrect = choiceId === current.correctChoiceId;
    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    }
    setFeedback({
      isCorrect,
      explanation: current.explanation,
      hint: current.hint,
    });
    setPhase('feedback');
  }

  function submitOrder() {
    if (!current?.orderItems || phase !== 'playing') {
      return;
    }
    const expected = current.orderItems.map((item) => item.id).join('|');
    const actual = orderDraft.map((item) => item.id).join('|');
    const isCorrect = expected === actual;
    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    }
    setFeedback({
      isCorrect,
      explanation: current.explanation,
      hint: current.hint,
    });
    setPhase('feedback');
  }

  function moveOrder(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= orderDraft.length) {
      return;
    }
    const next = [...orderDraft];
    const from = next[fromIndex];
    const to = next[toIndex];
    if (!from || !to) {
      return;
    }
    next[fromIndex] = to;
    next[toIndex] = from;
    setOrderDraft(next);
  }

  function continueAfterFeedback() {
    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setPhase('complete');
      setFeedback(null);
      onCompleteRef.current?.(correctCount, total);
      return;
    }
    setIndex(nextIndex);
    setFeedback(null);
    setPhase('playing');
    startOrder(nextIndex);
  }

  function retry() {
    setFeedback(null);
    setPhase('playing');
  }

  function restart() {
    setIndex(0);
    setCorrectCount(0);
    setPhase('playing');
    setFeedback(null);
    startOrder(0);
  }

  useEffect(() => {
    setIndex(0);
    setCorrectCount(0);
    setPhase('playing');
    setFeedback(null);
    const first = localized[0];
    setOrderDraft(first?.orderItems ? shuffle(first.orderItems) : []);
  }, [language, localized]);

  return {
    current,
    index,
    total,
    correctCount,
    phase,
    feedback,
    orderDraft,
    submitChoice,
    submitOrder,
    moveOrder,
    continueAfterFeedback,
    retry,
    restart,
  };
}
