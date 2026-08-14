import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ChildFamilyLearner, FamilyMember } from '../types';

const CHILD_FAMILY_SESSION_KEY = 'qq.child_family.session';

export type StoredChildFamilySession = {
  child: FamilyMember;
  familyCode: string;
  parentId: string | null;
  unlockedAt: string;
};

export function toChildFamilyLearner(child: FamilyMember): ChildFamilyLearner {
  return {
    ...child,
    role: 'child',
    session_mode: 'family_code',
  };
}

export async function loadChildFamilySession(): Promise<StoredChildFamilySession | null> {
  const raw = await AsyncStorage.getItem(CHILD_FAMILY_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredChildFamilySession;
    if (!parsed?.child?.id || parsed.child.role !== 'child') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveChildFamilySession(
  session: StoredChildFamilySession,
): Promise<void> {
  await AsyncStorage.setItem(CHILD_FAMILY_SESSION_KEY, JSON.stringify(session));
}

export async function clearChildFamilySession(): Promise<void> {
  await AsyncStorage.removeItem(CHILD_FAMILY_SESSION_KEY);
}
