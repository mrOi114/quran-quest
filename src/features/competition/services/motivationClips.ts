import type { ActiveLearner } from '@/features/auth';
import { resolveAgeGroup } from '@/features/learning';

export type MotivationEvent =
  | 'greeting'
  | 'correct'
  | 'incorrect'
  | 'complete'
  | 'next_challenge';

export type MotivationTone = 'playful' | 'respectful';

export type MotivationClipId =
  | 'greeting_welcome'
  | 'greeting_ready'
  | 'correct_mashaallah'
  | 'correct_great_job'
  | 'correct_awesome'
  | 'correct_doing_great'
  | 'correct_respectful'
  | 'incorrect_keep_going'
  | 'incorrect_almost'
  | 'incorrect_respectful'
  | 'complete_mashaallah'
  | 'complete_respectful'
  | 'next_challenge';

export type MotivationClip = {
  text: string;
  /** Reserved for a later local recording. Device TTS is used while this is null. */
  localUri: null;
};

/**
 * Fixed motivational phrases. These are not Qur’an content.
 * Playback uses device TTS until a recorded clip is attached.
 */
export const MOTIVATION_CLIPS: Record<MotivationClipId, MotivationClip> = {
  greeting_welcome: {
    text: 'Assalamu Alaikum! Welcome to Qur’an Quest.',
    localUri: null,
  },
  greeting_ready: {
    text: 'Are you ready?',
    localUri: null,
  },
  correct_mashaallah: {
    text: 'MashaAllah! Excellent!',
    localUri: null,
  },
  correct_great_job: {
    text: 'Great job!',
    localUri: null,
  },
  correct_awesome: {
    text: 'Awesome!',
    localUri: null,
  },
  correct_doing_great: {
    text: "You're doing great!",
    localUri: null,
  },
  correct_respectful: {
    text: 'MashaAllah. Excellent.',
    localUri: null,
  },
  incorrect_keep_going: {
    text: 'Good try! Keep going!',
    localUri: null,
  },
  incorrect_almost: {
    text: 'Almost! Let’s try the next one.',
    localUri: null,
  },
  incorrect_respectful: {
    text: 'Good effort. Keep going.',
    localUri: null,
  },
  complete_mashaallah: {
    text: 'MashaAllah! You completed the challenge!',
    localUri: null,
  },
  complete_respectful: {
    text: 'Challenge completed.',
    localUri: null,
  },
  next_challenge: {
    text: 'Ready for the next challenge?',
    localUri: null,
  },
};

const PLAYFUL_CORRECT: MotivationClipId[] = [
  'correct_mashaallah',
  'correct_great_job',
  'correct_awesome',
  'correct_doing_great',
];

const PLAYFUL_INCORRECT: MotivationClipId[] = [
  'incorrect_keep_going',
  'incorrect_almost',
];

function pickRotated(ids: MotivationClipId[], variant: number, fallback: MotivationClipId): MotivationClipId {
  if (ids.length === 0) {
    return fallback;
  }
  const index = ((variant % ids.length) + ids.length) % ids.length;
  return ids[index] ?? fallback;
}

export function pickMotivationClipIds(
  event: MotivationEvent,
  tone: MotivationTone,
  variant: number,
  isLastQuestion: boolean,
): MotivationClipId[] {
  if (event === 'greeting') {
    return ['greeting_welcome', 'greeting_ready'];
  }
  if (event === 'next_challenge') {
    return ['next_challenge'];
  }
  if (event === 'complete') {
    return [tone === 'playful' ? 'complete_mashaallah' : 'complete_respectful'];
  }
  if (event === 'correct') {
    if (tone === 'respectful') {
      return ['correct_respectful'];
    }
    return [pickRotated(PLAYFUL_CORRECT, variant, 'correct_mashaallah')];
  }
  if (event === 'incorrect') {
    if (tone === 'respectful') {
      return ['incorrect_respectful'];
    }
    if (isLastQuestion) {
      return ['incorrect_keep_going'];
    }
    return [pickRotated(PLAYFUL_INCORRECT, variant, 'incorrect_keep_going')];
  }
  return [];
}

export function joinClipText(ids: MotivationClipId[]): string {
  return ids
    .map((id) => MOTIVATION_CLIPS[id].text)
    .filter((text) => text.length > 0)
    .join(' ');
}

/** Ages 4–10 (learner groups 3–6 and 7–10) get playful encouragement. */
export function isPlayfulMotivation(learner: ActiveLearner): boolean {
  const group = resolveAgeGroup(learner);
  return group === 'child_3_6' || group === 'child_7_10';
}

export function motivationToneForLearner(learner: ActiveLearner | null | undefined): MotivationTone {
  if (!learner) {
    return 'respectful';
  }
  return isPlayfulMotivation(learner) ? 'playful' : 'respectful';
}

export function clipTextLeaksAnswer(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes('the answer') ||
    normalized.includes('correct answer') ||
    normalized.includes('wrong!') ||
    normalized.includes('choice a') ||
    normalized.includes('choice b') ||
    normalized.includes('choice c') ||
    normalized.includes('choice d')
  );
}
