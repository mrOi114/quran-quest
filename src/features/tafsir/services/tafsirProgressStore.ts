import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';

import {
  tafsirProgressPayloadSchema,
  type TafsirProgressPayload,
  type TafsirVerseProgress,
} from '../schemas';

const STORAGE_PREFIX = 'qq.tafsir.progress.v1';

function storageKey(learnerId: string): string {
  return `${STORAGE_PREFIX}.${learnerId}`;
}

function emptyPayload(): TafsirProgressPayload {
  return { version: 1, enabled: false, verses: {} };
}

function emptyVerse(verseId: string): TafsirVerseProgress {
  return {
    verseId,
    listenedSeconds: 0,
    durationSeconds: 0,
    lastPosition: 0,
    completed: false,
    understood: false,
    understandingCorrect: null,
  };
}

export async function loadTafsirProgress(
  learner: ActiveLearner,
): Promise<TafsirProgressPayload> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(learner.id));
    if (!raw) {
      return emptyPayload();
    }
    const parsed = tafsirProgressPayloadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyPayload();
  } catch {
    return emptyPayload();
  }
}

export async function saveTafsirProgress(
  learner: ActiveLearner,
  payload: TafsirProgressPayload,
): Promise<void> {
  const validated = tafsirProgressPayloadSchema.parse(payload);
  await AsyncStorage.setItem(storageKey(learner.id), JSON.stringify(validated));
}

export async function setTafsirEnabled(
  learner: ActiveLearner,
  enabled: boolean,
): Promise<TafsirProgressPayload> {
  const current = await loadTafsirProgress(learner);
  const next = { ...current, enabled };
  await saveTafsirProgress(learner, next);
  return next;
}

export function tafsirListenedPercent(verse: TafsirVerseProgress | undefined): number {
  if (!verse || verse.durationSeconds <= 0) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(100, Math.round((verse.listenedSeconds / verse.durationSeconds) * 100)),
  );
}

export async function recordTafsirListenProgress(
  learner: ActiveLearner,
  verseId: string,
  currentTime: number,
  duration: number,
  completed: boolean,
): Promise<TafsirProgressPayload> {
  const current = await loadTafsirProgress(learner);
  const previous = current.verses[verseId] ?? emptyVerse(verseId);
  const listenedSeconds = Math.max(previous.listenedSeconds, currentTime);
  const nextVerse: TafsirVerseProgress = {
    ...previous,
    listenedSeconds,
    durationSeconds: duration > 0 ? duration : previous.durationSeconds,
    lastPosition: completed ? 0 : currentTime,
    completed: previous.completed || completed,
  };
  const next = {
    ...current,
    verses: { ...current.verses, [verseId]: nextVerse },
  };
  await saveTafsirProgress(learner, next);
  return next;
}

export async function recordTafsirUnderstanding(
  learner: ActiveLearner,
  verseId: string,
  correct: boolean,
): Promise<TafsirProgressPayload> {
  const current = await loadTafsirProgress(learner);
  const previous = current.verses[verseId] ?? emptyVerse(verseId);
  const nextVerse: TafsirVerseProgress = {
    ...previous,
    understandingCorrect: correct,
    understood: previous.understood || correct,
  };
  const next = {
    ...current,
    verses: { ...current.verses, [verseId]: nextVerse },
  };
  await saveTafsirProgress(learner, next);
  return next;
}

export function getVerseTafsirProgress(
  payload: TafsirProgressPayload,
  verseId: string,
): TafsirVerseProgress {
  return payload.verses[verseId] ?? emptyVerse(verseId);
}
