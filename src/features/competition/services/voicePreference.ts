import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { MOTIVATION_SOUND_STORAGE } from '../constants';
import { stopMotivationSpeech } from './competitionVoice';

type SoundListener = (enabled: boolean) => void;

const listeners = new Set<SoundListener>();
let cachedEnabled: boolean | null = null;

function emit(enabled: boolean) {
  cachedEnabled = enabled;
  listeners.forEach((listener) => listener(enabled));
}

export async function loadMotivationSoundEnabled(): Promise<boolean> {
  if (cachedEnabled !== null) {
    return cachedEnabled;
  }
  try {
    const raw = await AsyncStorage.getItem(MOTIVATION_SOUND_STORAGE);
    cachedEnabled = raw !== 'off';
  } catch {
    cachedEnabled = true;
  }
  return cachedEnabled;
}

export async function setMotivationSoundEnabled(enabled: boolean): Promise<void> {
  emit(enabled);
  try {
    await AsyncStorage.setItem(MOTIVATION_SOUND_STORAGE, enabled ? 'on' : 'off');
  } catch {
    // Preference stays in memory for this session.
  }
  if (!enabled) {
    await stopMotivationSpeech();
  }
}

export function subscribeMotivationSound(listener: SoundListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMotivationSound() {
  const [enabled, setEnabled] = useState(cachedEnabled ?? true);
  const [loaded, setLoaded] = useState(cachedEnabled !== null);

  useEffect(() => {
    let cancelled = false;
    void loadMotivationSoundEnabled().then((value) => {
      if (!cancelled) {
        setEnabled(value);
        setLoaded(true);
      }
    });
    return subscribeMotivationSound((value) => {
      setEnabled(value);
    });
  }, []);

  const toggle = useCallback(async () => {
    await setMotivationSoundEnabled(!enabled);
  }, [enabled]);

  return { enabled, loaded, toggle };
}
