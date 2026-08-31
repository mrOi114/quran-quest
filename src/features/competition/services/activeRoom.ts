import AsyncStorage from '@react-native-async-storage/async-storage';

import { ACTIVE_CHALLENGE_STORAGE } from '../constants';
import { normalizeChallengeCode } from './pendingChallenge';

function isLiveStatus(status: string | undefined): boolean {
  return (
    status === 'waiting' ||
    status === 'ready_check' ||
    status === 'question' ||
    status === 'reveal'
  );
}

export async function saveActiveChallengeCode(code: string): Promise<void> {
  const normalized = normalizeChallengeCode(code);
  if (normalized.length < 4) {
    return;
  }
  await AsyncStorage.setItem(ACTIVE_CHALLENGE_STORAGE, normalized);
}

export async function peekActiveChallengeCode(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_CHALLENGE_STORAGE);
  if (!raw) {
    return null;
  }
  const normalized = normalizeChallengeCode(raw);
  return normalized.length >= 4 ? normalized : null;
}

export async function clearActiveChallengeCode(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_CHALLENGE_STORAGE);
}

export async function rememberLiveChallenge(
  code: string | undefined,
  status: string | undefined,
): Promise<void> {
  if (code && isLiveStatus(status)) {
    await saveActiveChallengeCode(code);
    return;
  }
  await clearActiveChallengeCode();
}

export { isLiveStatus };
