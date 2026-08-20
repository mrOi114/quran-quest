import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveLearner } from '@/features/auth';

import { QISAS_PROGRESS_VERSION } from '../constants';
import {
  qisasProgressPayloadSchema,
  type QisasLanguage,
  type QisasMode,
  type QisasProgressPayload,
  type QisasStoryProgress,
} from '../schemas';

const STORAGE_PREFIX = 'qq.qisas.progress.v1';

function storageKey(learnerId: string): string {
  return `${STORAGE_PREFIX}.${learnerId}`;
}

function emptyPayload(): QisasProgressPayload {
  return { version: QISAS_PROGRESS_VERSION, stories: {} };
}

function emptyStory(
  storyId: string,
  language: QisasLanguage,
): QisasStoryProgress {
  return {
    storyId,
    language,
    readCompleted: false,
    listenCompleted: false,
    questionsAnswered: 0,
    questionsCorrect: 0,
    gameCompleted: false,
    lastMode: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function loadQisasProgress(
  learner: ActiveLearner,
): Promise<QisasProgressPayload> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(learner.id));
    if (!raw) {
      return emptyPayload();
    }
    const parsed = qisasProgressPayloadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyPayload();
  } catch {
    return emptyPayload();
  }
}

export async function saveQisasProgress(
  learner: ActiveLearner,
  payload: QisasProgressPayload,
): Promise<void> {
  const validated = qisasProgressPayloadSchema.parse(payload);
  await AsyncStorage.setItem(storageKey(learner.id), JSON.stringify(validated));
}

export function getStoryProgress(
  payload: QisasProgressPayload,
  storyId: string,
  language: QisasLanguage,
): QisasStoryProgress {
  const existing = payload.stories[storyId];
  if (!existing) {
    return emptyStory(storyId, language);
  }
  return { ...existing, language };
}

async function patchStory(
  learner: ActiveLearner,
  storyId: string,
  language: QisasLanguage,
  patch: Partial<QisasStoryProgress>,
): Promise<QisasStoryProgress> {
  const payload = await loadQisasProgress(learner);
  const current = getStoryProgress(payload, storyId, language);
  const next: QisasStoryProgress = {
    ...current,
    ...patch,
    storyId,
    language,
    updatedAt: new Date().toISOString(),
  };
  payload.stories[storyId] = next;
  await saveQisasProgress(learner, payload);
  return next;
}

export async function markQisasRead(
  learner: ActiveLearner,
  storyId: string,
  language: QisasLanguage,
): Promise<QisasStoryProgress> {
  return patchStory(learner, storyId, language, {
    readCompleted: true,
    lastMode: 'read',
  });
}

export async function markQisasListenComplete(
  learner: ActiveLearner,
  storyId: string,
  language: QisasLanguage,
): Promise<QisasStoryProgress> {
  return patchStory(learner, storyId, language, {
    listenCompleted: true,
    lastMode: 'listen',
  });
}

export async function recordQisasLearn(
  learner: ActiveLearner,
  storyId: string,
  language: QisasLanguage,
  answered: number,
  correct: number,
): Promise<QisasStoryProgress> {
  return patchStory(learner, storyId, language, {
    questionsAnswered: answered,
    questionsCorrect: correct,
    lastMode: 'learn',
  });
}

export async function markQisasGameComplete(
  learner: ActiveLearner,
  storyId: string,
  language: QisasLanguage,
): Promise<QisasStoryProgress> {
  return patchStory(learner, storyId, language, {
    gameCompleted: true,
    lastMode: 'play',
  });
}

export async function setQisasLastMode(
  learner: ActiveLearner,
  storyId: string,
  language: QisasLanguage,
  mode: QisasMode,
): Promise<QisasStoryProgress> {
  return patchStory(learner, storyId, language, { lastMode: mode });
}
