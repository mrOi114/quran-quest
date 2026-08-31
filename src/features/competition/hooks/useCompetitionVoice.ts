import { useEffect, useRef } from 'react';

import { playMotivationEvent } from '../services/competitionVoice';
import type { MotivationTone } from '../services/motivationClips';
import type { CompetitionStatus } from '../types';

export function useCompetitionVoiceFeedback(input: {
  enabled: boolean;
  tone: MotivationTone;
  status: CompetitionStatus | undefined;
  questionIndex: number;
  questionCount: number;
  myCorrect: boolean | undefined;
  challengeCode: string | undefined;
}) {
  const lastKey = useRef('');

  useEffect(() => {
    if (!input.enabled || !input.status) {
      return;
    }

    if (input.status === 'reveal' && typeof input.myCorrect === 'boolean') {
      const key = `reveal:${input.challengeCode ?? ''}:${input.questionIndex}:${input.myCorrect}`;
      if (lastKey.current === key) {
        return;
      }
      lastKey.current = key;
      void playMotivationEvent(input.myCorrect ? 'correct' : 'incorrect', {
        enabled: true,
        tone: input.tone,
        variant: input.questionIndex,
        isLastQuestion: input.questionIndex >= input.questionCount - 1,
      });
      return;
    }

    if (input.status === 'complete' && input.challengeCode) {
      const key = `complete:${input.challengeCode}`;
      if (lastKey.current === key) {
        return;
      }
      lastKey.current = key;
      void playMotivationEvent('complete', {
        enabled: true,
        tone: input.tone,
      });
    }
  }, [
    input.challengeCode,
    input.enabled,
    input.myCorrect,
    input.questionCount,
    input.questionIndex,
    input.status,
    input.tone,
  ]);
}
