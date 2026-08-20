import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { MAX_GROUP_MEMBERS } from '@/constants/groupLimits';

import type { CreateChildInput, UpdateChildInput } from '../types';
import { getDeviceKey } from './deviceService';
import { assertFunctionOk } from './functionErrors';

const childSelect =
  'id, role, email, display_name, age, avatar_key, country_code, preferred_language, parent_id, family_code, created_at, updated_at';

function toProfile(
  row: {
    id: string;
    role: Profile['role'];
    email: string | null;
    display_name: string;
    age: number | null;
    avatar_key: string;
    country_code: string;
    preferred_language: string;
    parent_id: string | null;
    family_code?: string | null;
    created_at: string;
    updated_at: string;
  },
): Profile {
  return {
    ...row,
    family_code: row.family_code ?? null,
    chat_enabled: true,
    calls_enabled: true,
    pin_hash: null,
    pin_failed_attempts: 0,
    pin_locked_until: null,
  };
}

export async function createChildProfile(
  parentId: string,
  input: CreateChildInput,
): Promise<Profile> {
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId)
    .eq('role', 'child');

  if (countError) {
    throw new Error(countError.message || 'Could not create child profile');
  }
  if ((count ?? 0) + 1 >= MAX_GROUP_MEMBERS) {
    throw new Error('This family group already has the maximum number of members');
  }
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
    .select(childSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Could not create child profile');
  }

  try {
    await setChildPin(data.id, input.pin);
  } catch (pinError) {
    // Avoid orphan children without a usable PIN.
    await supabase.from('profiles').delete().eq('id', data.id).eq('parent_id', parentId);
    throw pinError;
  }

  return toProfile({ ...data, family_code: null });
}

export async function updateChildProfile(
  childId: string,
  input: UpdateChildInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName.trim(),
      age: input.age,
      avatar_key: input.avatarKey,
      country_code: input.countryCode.toUpperCase(),
      preferred_language: input.preferredLanguage,
    })
    .eq('id', childId)
    .eq('role', 'child')
    .select(childSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Could not update child profile');
  }

  return toProfile({ ...data, family_code: null });
}

export async function updateChildCommsSettings(
  childId: string,
  settings: { chatEnabled: boolean; callsEnabled: boolean },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      chat_enabled: settings.chatEnabled,
      calls_enabled: settings.callsEnabled,
    })
    .eq('id', childId)
    .eq('role', 'child');

  if (error) {
    throw new Error(error.message || 'Could not update communication settings');
  }
}

export async function deleteChildProfile(childId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', childId)
    .eq('role', 'child');

  if (error) {
    throw new Error(error.message || 'Could not delete child profile');
  }
}

export async function setChildPin(childId: string, pin: string): Promise<void> {
  const result = await supabase.functions.invoke<{ ok?: boolean; error?: string }>(
    'child-set-pin',
    {
      body: { child_id: childId, pin },
    },
  );

  await assertFunctionOk(result);
}

export async function verifyChildPin(childId: string, pin: string): Promise<void> {
  const deviceKey = await getDeviceKey();
  const result = await supabase.functions.invoke<{
    ok?: boolean;
    error?: string;
    locked_until?: string | null;
    failed_attempts?: number | null;
  }>('child-verify-pin', {
    body: {
      child_id: childId,
      pin,
      device_key: deviceKey,
    },
  });

  const data = await assertFunctionOk(result);

  if (!data.ok) {
    throw new Error('PIN verification failed');
  }
}
