import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import type { CreateChildInput } from '../types';
import { getDeviceKey } from './deviceService';

export async function createChildProfile(
  parentId: string,
  input: CreateChildInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      role: 'child',
      parent_id: parentId,
      display_name: input.displayName.trim(),
      age: input.age,
      avatar_key: input.avatarKey ?? 'default-1',
      country_code: input.countryCode.toUpperCase(),
      preferred_language: input.preferredLanguage,
      email: null,
    })
    .select(
      'id, role, email, display_name, age, avatar_key, country_code, preferred_language, parent_id, created_at, updated_at',
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Could not create child profile');
  }

  await setChildPin(data.id, input.pin);
  return {
    ...data,
    pin_hash: null,
    pin_failed_attempts: 0,
    pin_locked_until: null,
  };
}

export async function setChildPin(childId: string, pin: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('child-set-pin', {
    body: { child_id: childId, pin },
  });

  if (error) {
    throw new Error(error.message || 'Could not set child PIN');
  }

  if (data?.error) {
    throw new Error(String(data.error));
  }
}

export async function verifyChildPin(childId: string, pin: string): Promise<void> {
  const deviceKey = await getDeviceKey();
  const { data, error } = await supabase.functions.invoke('child-verify-pin', {
    body: {
      child_id: childId,
      pin,
      device_key: deviceKey,
    },
  });

  if (error) {
    throw new Error(error.message || 'Could not verify PIN');
  }

  if (data?.error) {
    throw new Error(String(data.error));
  }

  if (!data?.ok) {
    throw new Error('PIN verification failed');
  }
}
