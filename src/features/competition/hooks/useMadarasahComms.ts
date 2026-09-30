import { useCallback, useEffect, useRef, useState } from 'react';

import { FamilyCallPeer, isFamilyCallAudioSupported, type FamilyCallSignalPayload } from '@/features/family-comms';

import {
  endMadarasahCall,
  respondMadarasahCall,
  sendMadarasahMessage,
  signalMadarasahCall,
  startMadarasahCall,
  syncMadarasah,
  type MadarasahCallView,
  type MadarasahMemberView,
  type MadarasahMessage,
} from '../services/madarasahService';

const POLL_MS = 2000;

export function useMadarasahComms() {
  const [members, setMembers] = useState<MadarasahMemberView[]>([]);
  const [roomMessages, setRoomMessages] = useState<MadarasahMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<MadarasahMessage[]>([]);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<MadarasahCallView | null>(null);
  const [activeCall, setActiveCall] = useState<MadarasahCallView | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const peerRef = useRef<FamilyCallPeer | null>(null);
  const seenSignals = useRef(new Set<string>());
  const signalAfter = useRef<string | null>(null);
  const peerIdRef = useRef<string | null>(null);
  const myIdRef = useRef<string | null>(null);
  const callIdRef = useRef<string | null>(null);

  peerIdRef.current = peerId;
  myIdRef.current = myId;
  callIdRef.current = activeCall?.id ?? incoming?.id ?? null;

  const stopMedia = useCallback(() => {
    peerRef.current?.stop();
    peerRef.current = null;
  }, []);

  const applySignals = useCallback(async (callId: string, signals: MadarasahSyncSignals) => {
    for (const signal of signals) {
      if (seenSignals.current.has(signal.id)) {
        continue;
      }
      seenSignals.current.add(signal.id);
      if (!signalAfter.current || signal.created_at > signalAfter.current) {
        signalAfter.current = signal.created_at;
      }
      if (signal.sender_member_id === myIdRef.current) {
        continue;
      }
      const reply = await peerRef.current?.handleSignal(signal.payload);
      if (reply) {
        await signalMadarasahCall(callId, reply);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await syncMadarasah({
        peerMemberId: peerIdRef.current,
        signalAfter: signalAfter.current,
      });
      setMyId(data.member.id);
      setMembers(data.members);
      setRoomMessages(data.room_messages);
      setDirectMessages(data.direct_messages);
      setIncoming(data.incoming_call);
      setActiveCall(data.active_call);
      const call = data.active_call ?? data.incoming_call;
      if (call && (call.status === 'ended' || call.status === 'declined')) {
        stopMedia();
      }
      if (call && data.signals.length > 0) {
        await applySignals(call.id, data.signals);
      }
      setError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'not_member';
      if (message === 'not_member' || message === 'code_denied') {
        setError('not_member');
      }
    }
  }, [applySignals, stopMedia]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => {
      clearInterval(timer);
      stopMedia();
    };
  }, [refresh, stopMedia]);

  const sendRoom = useCallback(async (body: string) => {
    const next = await sendMadarasahMessage({ channel: 'room', body });
    setRoomMessages(next.room_messages);
    setMembers(next.members);
  }, []);

  const sendDirect = useCallback(async (body: string) => {
    if (!peerIdRef.current) {
      return;
    }
    const next = await sendMadarasahMessage({
      channel: 'direct',
      body,
      peerMemberId: peerIdRef.current,
    });
    setDirectMessages(next.direct_messages);
  }, []);

  const placeCall = useCallback(
    async (memberId: string) => {
      setBusy(true);
      setError(null);
      try {
        const call = await startMadarasahCall(memberId);
        setActiveCall(call);
        if (!isFamilyCallAudioSupported()) {
          setError('audio');
          return;
        }
        const peer = new FamilyCallPeer();
        peerRef.current = peer;
        await peer.start({
          isCaller: true,
          sendSignal: (payload: FamilyCallSignalPayload) => signalMadarasahCall(call.id, payload),
        });
      } catch (caught) {
        stopMedia();
        setError(caught instanceof Error ? caught.message : 'error');
      } finally {
        setBusy(false);
      }
    },
    [stopMedia],
  );

  const acceptCall = useCallback(async () => {
    const call = incoming;
    if (!call) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await respondMadarasahCall(call.id, true);
      signalAfter.current = null;
      seenSignals.current.clear();
      if (isFamilyCallAudioSupported()) {
        const peer = new FamilyCallPeer();
        peerRef.current = peer;
        await peer.start({
          isCaller: false,
          sendSignal: (payload: FamilyCallSignalPayload) => signalMadarasahCall(call.id, payload),
        });
      } else {
        setError('audio');
      }
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'error');
    } finally {
      setBusy(false);
    }
  }, [incoming, refresh]);

  const declineCall = useCallback(async () => {
    if (!incoming) {
      return;
    }
    await respondMadarasahCall(incoming.id, false).catch(() => undefined);
    setIncoming(null);
    stopMedia();
  }, [incoming, stopMedia]);

  const hangUp = useCallback(async () => {
    const callId = callIdRef.current;
    if (callId) {
      await endMadarasahCall(callId).catch(() => undefined);
    }
    setActiveCall(null);
    setIncoming(null);
    stopMedia();
  }, [stopMedia]);

  return {
    members,
    roomMessages,
    directMessages,
    peerId,
    setPeerId,
    incoming,
    activeCall,
    error,
    busy,
    sendRoom,
    sendDirect,
    placeCall,
    acceptCall,
    declineCall,
    hangUp,
  };
}

type MadarasahSyncSignals = Awaited<ReturnType<typeof syncMadarasah>>['signals'];
