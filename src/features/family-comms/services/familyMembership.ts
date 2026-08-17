import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import type { FamilyCircleState, FamilyDirectoryMember } from '../types';

const directorySelect =
  'id, role, display_name, age, avatar_key, parent_id, chat_enabled, calls_enabled';

function toMember(row: {
  id: string;
  role: string;
  display_name: string;
  age: number | null;
  avatar_key: string;
  parent_id: string | null;
  chat_enabled?: boolean | null;
  calls_enabled?: boolean | null;
}): FamilyDirectoryMember | null {
  if (row.role !== 'parent' && row.role !== 'child') {
    return null;
  }
  return {
    id: row.id,
    role: row.role,
    display_name: row.display_name,
    age: row.age,
    avatar_key: row.avatar_key,
    parent_id: row.parent_id,
    chat_enabled: row.chat_enabled ?? true,
    calls_enabled: row.calls_enabled ?? true,
  };
}

export function resolveFamilyActor(options: {
  profile: Profile | null;
  activeLearnerId: string | null;
  activeLearnerRole: string | null;
  activeLearnerParentId: string | null;
}): { actorId: string; familyId: string; actorRole: 'parent' | 'child' } | null {
  const { profile, activeLearnerId, activeLearnerRole, activeLearnerParentId } = options;

  if (activeLearnerRole === 'child' && activeLearnerId && activeLearnerParentId) {
    return {
      actorId: activeLearnerId,
      familyId: activeLearnerParentId,
      actorRole: 'child',
    };
  }

  if (profile?.role === 'parent') {
    return {
      actorId: profile.id,
      familyId: profile.id,
      actorRole: 'parent',
    };
  }

  if (profile?.role === 'child' && profile.parent_id) {
    return {
      actorId: profile.id,
      familyId: profile.parent_id,
      actorRole: 'child',
    };
  }

  return null;
}

export async function fetchFamilyCircle(options: {
  actorId: string;
  familyId: string;
  actorRole: 'parent' | 'child';
}): Promise<FamilyCircleState> {
  const { actorId, familyId, actorRole } = options;

  const { data: parent, error: parentError } = await supabase
    .from('profiles')
    .select(directorySelect)
    .eq('id', familyId)
    .eq('role', 'parent')
    .maybeSingle();

  if (parentError) {
    throw new Error(parentError.message || 'Access denied');
  }
  if (!parent) {
    throw new Error('Access denied');
  }

  const { data: children, error: childrenError } = await supabase
    .from('profiles')
    .select(directorySelect)
    .eq('parent_id', familyId)
    .eq('role', 'child')
    .order('created_at', { ascending: true });

  if (childrenError) {
    throw new Error(childrenError.message || 'Access denied');
  }

  const members = [toMember(parent), ...(children ?? []).map(toMember)].filter(
    (row): row is FamilyDirectoryMember => Boolean(row),
  );

  if (!members.some((member) => member.id === actorId)) {
    throw new Error('Access denied');
  }

  const actor = members.find((member) => member.id === actorId);
  return {
    familyId,
    actorId,
    actorRole,
    members,
    chatEnabled: actorRole === 'parent' ? true : Boolean(actor?.chat_enabled),
    callsEnabled: actorRole === 'parent' ? true : Boolean(actor?.calls_enabled),
  };
}

export function callableMembers(
  circle: FamilyCircleState,
): FamilyDirectoryMember[] {
  if (!circle.callsEnabled) {
    return [];
  }
  return circle.members.filter((member) => {
    if (member.id === circle.actorId) {
      return false;
    }
    if (member.role === 'child' && !member.calls_enabled) {
      return false;
    }
    return true;
  });
}
