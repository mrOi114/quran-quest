import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

import { assertFunctionOk } from './functionErrors';

const DEVICE_KEY_STORAGE = 'qq.device_key';

async function getOrCreateDeviceKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_KEY_STORAGE);
  if (existing) {
    return existing;
  }

  const seedParts = [
    Application.applicationId ?? 'quran-quest',
    Device.modelId ?? Device.modelName ?? 'unknown-model',
    Platform.OS,
    Crypto.randomUUID(),
  ];

  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    seedParts.join(':'),
  );

  await SecureStore.setItemAsync(DEVICE_KEY_STORAGE, digest);
  return digest;
}

export async function getDeviceKey(): Promise<string> {
  return getOrCreateDeviceKey();
}

export async function registerCurrentDevice(label?: string): Promise<void> {
  const deviceKey = await getOrCreateDeviceKey();
  const fallbackLabel =
    [Device.brand, Device.modelName].filter(Boolean).join(' ') || `${Platform.OS} device`;
  const deviceLabel = label ?? fallbackLabel;

  const result = await supabase.functions.invoke<{
    device?: unknown;
    error?: string;
  }>('register-device', {
    body: {
      device_key: deviceKey,
      label: deviceLabel,
    },
  });

  await assertFunctionOk(result);
}
