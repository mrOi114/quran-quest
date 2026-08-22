import AsyncStorage from '@react-native-async-storage/async-storage';

import { PENDING_CHALLENGE_STORAGE } from '../constants';

export function normalizeChallengeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export async function savePendingChallengeCode(code: string): Promise<void> {
  const normalized = normalizeChallengeCode(code);
  if (normalized.length < 4) {
    return;
  }
  await AsyncStorage.setItem(PENDING_CHALLENGE_STORAGE, normalized);
}

export async function peekPendingChallengeCode(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(PENDING_CHALLENGE_STORAGE);
  if (!raw) {
    return null;
  }
  const normalized = normalizeChallengeCode(raw);
  return normalized.length >= 4 ? normalized : null;
}

export async function consumePendingChallengeCode(): Promise<string | null> {
  const code = await peekPendingChallengeCode();
  if (code) {
    await AsyncStorage.removeItem(PENDING_CHALLENGE_STORAGE);
  }
  return code;
}
