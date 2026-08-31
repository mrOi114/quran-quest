import * as Speech from 'expo-speech';

import {
  joinClipText,
  pickMotivationClipIds,
  type MotivationEvent,
  type MotivationTone,
} from './motivationClips';
import { stopQuestionSpeech } from './speakEnglishQuestion';

const PLAYFUL_RATE = 0.9;
const PLAYFUL_PITCH = 1.08;
const RESPECTFUL_RATE = 0.95;
const RESPECTFUL_PITCH = 1.0;

let greetingPlayed = false;
let greetingInFlight = false;
let greetingReleaseTimer: ReturnType<typeof setTimeout> | null = null;

function speechOptions(tone: MotivationTone) {
  return {
    language: 'en-US' as const,
    rate: tone === 'playful' ? PLAYFUL_RATE : RESPECTFUL_RATE,
    pitch: tone === 'playful' ? PLAYFUL_PITCH : RESPECTFUL_PITCH,
  };
}

export async function stopMotivationSpeech(): Promise<void> {
  await Speech.stop();
}

export async function playMotivationEvent(
  event: MotivationEvent,
  options: {
    enabled: boolean;
    tone: MotivationTone;
    variant?: number;
    isLastQuestion?: boolean;
  },
): Promise<void> {
  if (!options.enabled) {
    return;
  }
  const ids = pickMotivationClipIds(
    event,
    options.tone,
    options.variant ?? 0,
    options.isLastQuestion ?? false,
  );
  const text = joinClipText(ids);
  if (!text) {
    return;
  }
  try {
    await stopQuestionSpeech();
    Speech.speak(text, speechOptions(options.tone));
  } catch {
    // Device TTS can be unavailable; visual encouragement still works.
  }
}

/**
 * Plays the shared greeting once per Competition visit.
 * Safe to call from layout autoplay and from a later user tap (web gesture).
 */
export function playGreetingOnce(options: { enabled: boolean; tone: MotivationTone }): void {
  if (!options.enabled || greetingPlayed || greetingInFlight) {
    return;
  }
  greetingInFlight = true;
  if (greetingReleaseTimer) {
    clearTimeout(greetingReleaseTimer);
  }
  greetingReleaseTimer = setTimeout(() => {
    greetingInFlight = false;
  }, 1800);

  const text = joinClipText(pickMotivationClipIds('greeting', options.tone, 0, false));
  void stopQuestionSpeech()
    .then(() => {
      Speech.speak(text, {
        ...speechOptions(options.tone),
        onStart: () => {
          greetingPlayed = true;
          greetingInFlight = false;
        },
        onDone: () => {
          greetingPlayed = true;
          greetingInFlight = false;
        },
        onStopped: () => {
          greetingInFlight = false;
        },
        onError: () => {
          greetingInFlight = false;
        },
      });
    })
    .catch(() => {
      greetingInFlight = false;
    });
}
