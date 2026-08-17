import type {
  FamilyCall,
  FamilyCallStatus,
  FamilyMessage,
  FamilyMessageKind,
} from '@/types';

export type FamilyDirectoryMember = {
  id: string;
  role: 'parent' | 'child';
  display_name: string;
  age: number | null;
  avatar_key: string;
  parent_id: string | null;
  chat_enabled: boolean;
  calls_enabled: boolean;
};

export type FamilyCircleState = {
  familyId: string;
  actorId: string;
  actorRole: 'parent' | 'child';
  members: FamilyDirectoryMember[];
  chatEnabled: boolean;
  callsEnabled: boolean;
};

export type FamilyChatMessage = FamilyMessage & {
  senderName: string;
  isMine: boolean;
};

export type FamilyCallView = FamilyCall & {
  localRole: 'caller' | 'callee';
  peer: FamilyDirectoryMember | null;
};

export type FamilyCallSignalPayload =
  | { type: 'offer'; sdp: string }
  | { type: 'answer'; sdp: string }
  | { type: 'ice'; candidate: Record<string, unknown> };

export type { FamilyCall, FamilyCallStatus, FamilyMessage, FamilyMessageKind };
