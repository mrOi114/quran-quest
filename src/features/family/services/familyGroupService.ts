import { supabase } from '@/lib/supabase';

import type { FamilyDirectoryMember } from '@/features/family-comms';

export type FamilyGroupState = {
  kind: 'family';
  familyId: string;
  familyCode: string;
  adminId: string;
  memberCount: number;
  memberLimit: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function ensureFamilyGroup(): Promise<FamilyGroupState> {
  const { data, error } = await supabase.rpc('ensure_family_group');
  if (error || !isRecord(data)) {
    throw new Error(error?.message || 'Could not create your Family Group');
  }
  const familyId = typeof data.family_id === 'string' ? data.family_id : '';
  const familyCode = typeof data.family_code === 'string' ? data.family_code : '';
  if (!familyId || !familyCode) {
    throw new Error('Could not create your Family Group');
  }
  return {
    kind: 'family',
    familyId,
    familyCode,
    adminId: typeof data.admin_id === 'string' ? data.admin_id : familyId,
    memberCount: typeof data.member_count === 'number' ? data.member_count : 1,
    memberLimit: typeof data.member_limit === 'number' ? data.member_limit : 7,
  };
}

export function familyMemberCount(members: FamilyDirectoryMember[]): number {
  return members.length;
}
