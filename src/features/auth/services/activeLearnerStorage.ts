import * as SecureStore from 'expo-secure-store';

const ACTIVE_LEARNER_KEY = 'qq.active_learner_id';

export async function getStoredActiveLearnerId(): Promise<string | null> {
  return SecureStore.getItemAsync(ACTIVE_LEARNER_KEY);
}

export async function setStoredActiveLearnerId(learnerId: string): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_LEARNER_KEY, learnerId);
}

export async function clearStoredActiveLearnerId(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_LEARNER_KEY);
}
