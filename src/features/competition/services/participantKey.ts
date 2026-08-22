import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { PARTICIPANT_KEY_STORAGE } from '../constants';

export async function getOrCreateParticipantKey(): Promise<string> {
  const existing = await AsyncStorage.getItem(PARTICIPANT_KEY_STORAGE);
  if (existing && existing.length >= 16) {
    return existing;
  }
  const next = Crypto.randomUUID();
  await AsyncStorage.setItem(PARTICIPANT_KEY_STORAGE, next);
  return next;
}
