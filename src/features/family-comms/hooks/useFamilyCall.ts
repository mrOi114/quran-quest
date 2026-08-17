import { useCallback, useEffect, useRef, useState } from 'react';

import { FAMILY_CALL_RING_TIMEOUT_MS } from '../constants';
import {
  FamilyCallPeer,
  fetchFamilyCall,
  isFamilyCallAudioSupported,
  notifyFamilyEvent,
  sendCallSignal,
  setParticipantMuted,
  startFamilyCall,
  subscribeToCallSignals,
  updateFamilyCallStatus,
} from '../services';
import type { FamilyCall, FamilyCallSignalPayload, FamilyCircleState } from '../types';

export function useFamilyCall(circle: FamilyCircleState | null) {
  const [activeCall, setActiveCall] = useState<FamilyCall | null>(null);
  const [statusLabel, setStatusLabel] = useState('Idle');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const peerRef = useRef<FamilyCallPeer | null>(null);
  const unsubscribeSignals = useRef<(() => void) | null>(null);

  const cleanupPeer = useCallback(() => {
    unsubscribeSignals.current?.();
    unsubscribeSignals.current = null;
    peerRef.current?.stop();
    peerRef.current = null;
    setMuted(false);
  }, []);

  const attachSignals = useCallback(
    (call: FamilyCall, peer: FamilyCallPeer) => {
      unsubscribeSignals.current?.();
      unsubscribeSignals.current = subscribeToCallSignals(call.id, (row) => {
        if (row.sender_id === circle?.actorId) {
          return;
        }
        void peer.handleSignal(row.payload).then((reply) => {
          if (reply && circle) {
            void sendCallSignal({
              callId: call.id,
              senderId: circle.actorId,
              payload: reply,
            });
          }
        });
      });
    },
    [circle],
  );

  useEffect(() => {
    return () => {
      cleanupPeer();
    };
  }, [cleanupPeer]);

  const placeCall = useCallback(
    async (calleeId: string) => {
      if (!circle) {
        throw new Error('Access denied');
      }
      if (!circle.callsEnabled) {
        throw new Error('Calls are turned off for this child. Ask a parent to enable them.');
      }
      setBusy(true);
      setError(null);
      try {
        const call = await startFamilyCall({
          familyId: circle.familyId,
          callerId: circle.actorId,
          calleeId,
        });
        setActiveCall(call);
        setStatusLabel('Calling…');

        const peer = new FamilyCallPeer();
        peerRef.current = peer;
        if (isFamilyCallAudioSupported()) {
          await peer.start({
            isCaller: true,
            sendSignal: (payload: FamilyCallSignalPayload) =>
              sendCallSignal({
                callId: call.id,
                senderId: circle.actorId,
                payload,
              }),
          });
        }
        attachSignals(call, peer);

        const callee = circle.members.find((member) => member.id === calleeId);
        void notifyFamilyEvent({
          kind: 'call',
          familyId: circle.familyId,
          recipientIds: [calleeId],
          title: 'Incoming Family Call',
          body: `${circle.members.find((member) => member.id === circle.actorId)?.display_name ?? 'Family'} is calling`,
          callId: call.id,
        });
        setStatusLabel(`Calling ${callee?.display_name ?? 'family member'}…`);

        globalThis.setTimeout(() => {
          void (async () => {
            const latest = await fetchFamilyCall(call.id).catch(() => null);
            if (latest?.status === 'ringing') {
              await updateFamilyCallStatus(call.id, 'missed').catch(() => undefined);
            }
          })();
        }, FAMILY_CALL_RING_TIMEOUT_MS);
      } catch (err) {
        cleanupPeer();
        setActiveCall(null);
        setStatusLabel('Idle');
        setError(err instanceof Error ? err.message : 'Access denied');
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [attachSignals, circle, cleanupPeer],
  );

  const acceptCall = useCallback(
    async (call: FamilyCall) => {
      if (!circle) {
        throw new Error('Access denied');
      }
      setBusy(true);
      setError(null);
      try {
        const accepted = await updateFamilyCallStatus(call.id, 'accepted');
        setActiveCall(accepted);
        setStatusLabel('Connected');
        const peer = peerRef.current ?? new FamilyCallPeer();
        peerRef.current = peer;
        if (isFamilyCallAudioSupported()) {
          await peer.start({
            isCaller: false,
            sendSignal: (payload: FamilyCallSignalPayload) =>
              sendCallSignal({
                callId: call.id,
                senderId: circle.actorId,
                payload,
              }),
          });
        }
        attachSignals(accepted, peer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Access denied');
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [attachSignals, circle],
  );

  const declineCall = useCallback(async (call: FamilyCall) => {
    await updateFamilyCallStatus(call.id, 'declined');
    cleanupPeer();
    setActiveCall(null);
    setStatusLabel('Declined');
  }, [cleanupPeer]);

  const endCall = useCallback(async () => {
    if (activeCall && (activeCall.status === 'ringing' || activeCall.status === 'accepted')) {
      await updateFamilyCallStatus(
        activeCall.id,
        activeCall.status === 'ringing' ? 'ended' : 'ended',
      ).catch(() => undefined);
    }
    cleanupPeer();
    setActiveCall(null);
    setStatusLabel('Ended');
  }, [activeCall, cleanupPeer]);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    peerRef.current?.setMuted(next);
    setMuted(next);
    if (activeCall && circle) {
      await setParticipantMuted({
        callId: activeCall.id,
        profileId: circle.actorId,
        muted: next,
      }).catch(() => undefined);
    }
  }, [activeCall, circle, muted]);

  const syncRemoteCall = useCallback(
    (call: FamilyCall) => {
      setActiveCall((current) => {
        if (current?.id === call.id) {
          if (call.status === 'accepted') {
            setStatusLabel('Connected');
          }
          if (call.status === 'ended' || call.status === 'declined' || call.status === 'missed') {
            cleanupPeer();
            setStatusLabel(call.status === 'declined' ? 'Declined' : 'Ended');
            return null;
          }
          return call;
        }
        return current;
      });
    },
    [cleanupPeer],
  );

  return {
    activeCall,
    statusLabel,
    muted,
    error,
    busy,
    audioSupported: isFamilyCallAudioSupported(),
    placeCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    syncRemoteCall,
    setIncomingCall: setActiveCall,
  };
}
