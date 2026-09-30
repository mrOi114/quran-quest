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

type StoredChallenge = {
  code: string;
  roomName: string | null;
};

function readStoredChallenge(raw: string | null): StoredChallenge | null {
  if (!raw) {
    return null;
  }
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as { code?: string; room?: string };
      const code = normalizeChallengeCode(parsed.code ?? '');
      if (code.length < 4) {
        return null;
      }
      const roomName = parsed.room?.trim() ? parsed.room : null;
      return { code, roomName };
    } catch {
      return null;
    }
  }
  const code = normalizeChallengeCode(raw);
  return code.length >= 4 ? { code, roomName: null } : null;
}

export async function peekActiveChallengeCode(): Promise<string | null> {
  const stored = readStoredChallenge(await AsyncStorage.getItem(ACTIVE_CHALLENGE_STORAGE));
  return stored?.code ?? null;
}

export async function peekActiveChallengeRoom(): Promise<string | null> {
  const stored = readStoredChallenge(await AsyncStorage.getItem(ACTIVE_CHALLENGE_STORAGE));
  return stored?.roomName ?? null;
}

export async function clearActiveChallengeCode(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_CHALLENGE_STORAGE);
}

export async function rememberLiveChallenge(
  code: string | undefined,
  status: string | undefined,
  roomName?: string | null,
): Promise<void> {
  if (code && isLiveStatus(status)) {
    const normalized = normalizeChallengeCode(code);
    if (normalized.length < 4) {
      return;
    }
    if (roomName) {
      await AsyncStorage.setItem(
        ACTIVE_CHALLENGE_STORAGE,
        JSON.stringify({ code: normalized, room: roomName }),
      );
      return;
    }
    await saveActiveChallengeCode(normalized);
    return;
  }
  await clearActiveChallengeCode();
}

export { isLiveStatus };
