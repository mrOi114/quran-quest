import { useEffect } from 'react';

import { useAuth } from '@/features/auth';

import { playGreetingOnce, stopMotivationSpeech } from '../services/competitionVoice';
import { motivationToneForLearner } from '../services/motivationClips';
import { useMotivationSound } from '../services/voicePreference';

/** Plays the Competition greeting once when the room is opened. */
export function CompetitionVoiceHost() {
  const { activeLearner } = useAuth();
  const { enabled, loaded } = useMotivationSound();
  const tone = motivationToneForLearner(activeLearner);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    playGreetingOnce({ enabled, tone });
  }, [enabled, loaded, tone]);

  useEffect(() => {
    return () => {
      void stopMotivationSpeech();
    };
  }, []);

  return null;
}
