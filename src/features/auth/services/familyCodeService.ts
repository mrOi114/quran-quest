import { Platform } from 'react-native';
import * as Device from 'expo-device';

import { supabase } from '@/lib/supabase';

import type { FamilyMember } from '../types';
import { getDeviceKey } from './deviceService';
import { assertFunctionOk } from './functionErrors';

/**
 * Public child path (no parent JWT on the child device):
 * 1. resolve-family-code lists children (names/avatars only)
 * 2. child-unlock-with-code verifies PIN, approves the device, returns the child
 * 3. Client stores ChildFamilyLearner locally
 * Learning progress for this session is device-local (guest-like), keyed by child id,
 * because existing RLS requires an authenticated parent/learner JWT for cloud writes.
 */

export type FamilyCodeChild = FamilyMember;

export type ResolvedFamilyCode = {
  familyCode: string;
  familyName: string;
  parentId: string;
  children: FamilyCodeChild[];
};

function normalizeFamilyCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function ensureParentFamilyCode(): Promise<string> {
  const { data, error } = await supabase.rpc('ensure_parent_family_code');
  if (error || typeof data !== 'string' || !data) {
    throw new Error(error?.message || 'Could not load your family code');
  }
  return data;
}

export async function resolveFamilyCode(familyCodeInput: string): Promise<ResolvedFamilyCode> {
  const familyCode = normalizeFamilyCode(familyCodeInput);
  const result = await supabase.functions.invoke<{
    ok?: boolean;
    error?: string;
    family_code?: string;
    family_name?: string;
    parent_id?: string;
    children?: Array<{
      id: string;
      display_name: string;
      age: number | null;
      avatar_key: string;
      preferred_language: string;
      country_code: string;
      parent_id: string | null;
      role: 'child';
    }>;
  }>('resolve-family-code', {
    body: { family_code: familyCode },
  });

  const data = await assertFunctionOk(result);
  if (!data.ok || !data.family_code || !data.parent_id || !data.family_name) {
    throw new Error(data.error || 'Family code not found');
  }

  return {
    familyCode: data.family_code,
    familyName: data.family_name,
    parentId: data.parent_id,
    children: (data.children ?? []).map((child) => ({
      id: child.id,
      role: 'child',
      display_name: child.display_name,
      age: child.age,
      avatar_key: child.avatar_key,
      country_code: child.country_code,
      preferred_language: child.preferred_language,
      parent_id: child.parent_id,
    })),
  };
}

export async function unlockChildWithFamilyCode(options: {
  familyCode: string;
  childId: string;
  pin: string;
}): Promise<FamilyMember> {
  const deviceKey = await getDeviceKey();
  const deviceLabel =
    [Device.brand, Device.modelName].filter(Boolean).join(' ') || `${Platform.OS} device`;

  const result = await supabase.functions.invoke<{
    ok?: boolean;
    error?: string;
    session?: {
      access_token: string;
      refresh_token: string;
      expires_in: number | null;
      token_type: string;
    };
    child?: {
      id: string;
      role: 'child';
      display_name: string;
      age: number | null;
      avatar_key: string;
      country_code: string;
      preferred_language: string;
      parent_id: string | null;
    };
  }>('child-unlock-with-code', {
    body: {
      family_code: normalizeFamilyCode(options.familyCode),
      child_id: options.childId,
      pin: options.pin,
      device_key: deviceKey,
      device_label: deviceLabel,
    },
  });

  const data = await assertFunctionOk(result);
  if (!data.ok || !data.child) {
    throw new Error(data.error || 'Could not unlock child profile');
  }

  if (data.session?.access_token && data.session.refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (sessionError) {
      throw new Error(sessionError.message || 'Could not start child session');
    }
  }

  return {
    id: data.child.id,
    role: 'child',
    display_name: data.child.display_name,
    age: data.child.age,
    avatar_key: data.child.avatar_key,
    country_code: data.child.country_code,
    preferred_language: data.child.preferred_language,
    parent_id: data.child.parent_id,
  };
}
