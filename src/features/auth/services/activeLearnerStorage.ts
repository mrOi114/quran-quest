import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACTIVE_LEARNER_KEY = 'qq.active_learner_id';

function isWebStorageAvailable(): boolean {
  return Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined';
}

export async function getStoredActiveLearnerId(): Promise<string | null> {
  if (isWebStorageAvailable()) {
    return globalThis.localStorage.getItem(ACTIVE_LEARNER_KEY);
  }

  return SecureStore.getItemAsync(ACTIVE_LEARNER_KEY);
}

export async function setStoredActiveLearnerId(learnerId: string): Promise<void> {
  if (isWebStorageAvailable()) {
    globalThis.localStorage.setItem(ACTIVE_LEARNER_KEY, learnerId);
    return;
  }

  await SecureStore.setItemAsync(ACTIVE_LEARNER_KEY, learnerId);
}

export async function clearStoredActiveLearnerId(): Promise<void> {
  if (isWebStorageAvailable()) {
    globalThis.localStorage.removeItem(ACTIVE_LEARNER_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACTIVE_LEARNER_KEY);
}
