import { useRouter } from 'expo-router';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import { useAuth } from '@/features/auth';

import { useFamilyCall } from '../hooks/useFamilyCall';
import { useFamilyCircle } from '../hooks/useFamilyCircle';
import {
  registerFamilyCallCategory,
  registerFamilyPushToken,
  requestFamilyNotificationPermission,
  subscribeToFamilyCalls,
} from '../services';
import type { FamilyCall, FamilyCircleState } from '../types';
import { IncomingCallOverlay } from './IncomingCallOverlay';

type FamilyCommsContextValue = {
  circle: FamilyCircleState | null;
  loading: boolean;
  error: string | null;
  canUseFamilyComms: boolean;
  reload: () => Promise<void>;
  call: ReturnType<typeof useFamilyCall>;
};

const FamilyCommsContext = createContext<FamilyCommsContextValue | null>(null);

export function useFamilyComms(): FamilyCommsContextValue {
  const value = useContext(FamilyCommsContext);
  if (!value) {
    throw new Error('useFamilyComms must be used inside FamilyCommsProvider');
  }
  return value;
}

export function FamilyCommsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { profile, session } = useAuth();
  const { circle, loading, error, canUseFamilyComms, reload } = useFamilyCircle();
  const call = useFamilyCall(circle);
  const { syncRemoteCall, setIncomingCall, acceptCall, declineCall, busy } = call;

  useEffect(() => {
    if (!session || !profile || (profile.role !== 'parent' && profile.role !== 'child')) {
      return;
    }
    void requestFamilyNotificationPermission()
      .then((allowed) => {
        if (!allowed) {
          return;
        }
        return registerFamilyCallCategory();
      })
      .then(() => registerFamilyPushToken(profile.id))
      .catch(() => undefined);
  }, [profile, session]);

  useEffect(() => {
    if (!circle) {
      return;
    }
    const familyId = circle.familyId;
    const actorId = circle.actorId;
    return subscribeToFamilyCalls(familyId, (row: FamilyCall) => {
      syncRemoteCall(row);
      if (row.status === 'ringing' && row.callee_id === actorId && row.created_by !== actorId) {
        setIncomingCall(row);
      }
    });
  }, [circle, setIncomingCall, syncRemoteCall]);

  const incoming =
    call.activeCall?.status === 'ringing' && call.activeCall.callee_id === circle?.actorId
      ? call.activeCall
      : null;

  const callerName = incoming
    ? circle?.members.find((member) => member.id === incoming.created_by)?.display_name ??
      'Family member'
    : '';

  const value = useMemo(
    () => ({
      circle,
      loading,
      error,
      canUseFamilyComms,
      reload,
      call,
    }),
    [call, canUseFamilyComms, circle, error, loading, reload],
  );

  return (
    <FamilyCommsContext.Provider value={value}>
      {children}
      {incoming && circle ? (
        <IncomingCallOverlay
          callerName={callerName}
          busy={busy}
          onAccept={() =>
            void acceptCall(incoming).then(() => router.push('/(app)/family/call'))
          }
          onDecline={() => void declineCall(incoming)}
        />
      ) : null}
    </FamilyCommsContext.Provider>
  );
}
