import type { CircleKind, CircleMemberRole, TeacherApprovalStatus } from '@/types';

export type CircleDirectoryMember = {
  profileId: string;
  displayName: string;
  avatarKey: string;
  memberRole: CircleMemberRole;
  profileRole: 'adult' | 'parent' | 'child';
  age: number | null;
  joinedAt: string;
  timeoutUntil: string | null;
  timedOut: boolean;
};

export type CircleSummary = {
  id: string;
  kind: CircleKind;
  name: string;
  creatorId: string;
  joinCode: string;
  chatEnabled: boolean;
  audioEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  memberLimit: number;
  myRole: CircleMemberRole | null;
  timeoutUntil: string | null;
  timedOut: boolean;
  canManage: boolean;
  isAdmin: boolean;
  members: CircleDirectoryMember[];
};

export type TeacherRequestState = {
  profileId: string;
  status: TeacherApprovalStatus;
  bootstrap?: boolean;
};

export type PendingTeacher = {
  profileId: string;
  displayName: string;
  status: TeacherApprovalStatus;
  requestedAt: string;
};
