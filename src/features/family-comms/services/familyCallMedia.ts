import { FAMILY_CALL_ICE_SERVERS } from '../constants';
import type { FamilyCallSignalPayload } from '../types';

type IceCandidateInit = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

type FamilyRtcPeer = {
  localDescription: { type: string; sdp: string } | null;
  addTrack: (track: MediaStreamTrack, stream: MediaStream) => void;
  addIceCandidate: (candidate: IceCandidateInit) => Promise<void>;
  setLocalDescription: (desc: { type: string; sdp: string }) => Promise<void>;
  setRemoteDescription: (desc: { type: string; sdp: string }) => Promise<void>;
  createOffer: () => Promise<{ type: string; sdp: string }>;
  createAnswer: () => Promise<{ type: string; sdp: string }>;
  close: () => void;
  onicecandidate: ((event: { candidate: IceCandidateInit | null }) => void) | null;
  ontrack: ((event: { streams: MediaStream[] }) => void) | null;
};

type WebRtcGlobals = {
  RTCPeerConnection: new (config?: { iceServers?: Array<{ urls: string }> }) => FamilyRtcPeer;
};

function getWebRtc(): WebRtcGlobals | null {
  const rtc = (globalThis as { RTCPeerConnection?: WebRtcGlobals['RTCPeerConnection'] })
    .RTCPeerConnection;
  if (typeof rtc !== 'function') {
    return null;
  }
  return { RTCPeerConnection: rtc };
}

function getUserMedia(constraints: { audio: boolean; video: boolean }): Promise<MediaStream> {
  const media = (
    globalThis as {
      navigator?: { mediaDevices?: { getUserMedia?: (c: unknown) => Promise<MediaStream> } };
    }
  ).navigator?.mediaDevices?.getUserMedia;
  if (!media) {
    return Promise.reject(new Error('Microphone is not available on this device.'));
  }
  return media.call(globalThis.navigator.mediaDevices, constraints);
}

export function isFamilyCallAudioSupported(): boolean {
  return Boolean(
    getWebRtc() &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function',
  );
}

export class FamilyCallPeer {
  private connection: FamilyRtcPeer | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private muted = false;

  async start(options: {
    isCaller: boolean;
    sendSignal: (payload: FamilyCallSignalPayload) => Promise<void>;
  }): Promise<void> {
    const webrtc = getWebRtc();
    if (!webrtc) {
      throw new Error('Voice calls are available in the web app on this device.');
    }

    this.localStream = await getUserMedia({ audio: true, video: false });
    this.connection = new webrtc.RTCPeerConnection({ iceServers: FAMILY_CALL_ICE_SERVERS });

    for (const track of this.localStream.getTracks()) {
      this.connection.addTrack(track, this.localStream);
    }

    this.connection.onicecandidate = (event) => {
      if (!event.candidate?.candidate) {
        return;
      }
      void options.sendSignal({
        type: 'ice',
        candidate: event.candidate as unknown as Record<string, unknown>,
      });
    };

    this.connection.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream || typeof document === 'undefined') {
        return;
      }
      if (!this.remoteAudio) {
        this.remoteAudio = document.createElement('audio');
        this.remoteAudio.autoplay = true;
      }
      this.remoteAudio.srcObject = stream;
      void this.remoteAudio.play().catch(() => undefined);
    };

    if (options.isCaller) {
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      await options.sendSignal({ type: 'offer', sdp: offer.sdp });
    }
  }

  async handleSignal(payload: FamilyCallSignalPayload): Promise<FamilyCallSignalPayload | null> {
    if (!this.connection) {
      return null;
    }
    if (payload.type === 'offer') {
      await this.connection.setRemoteDescription({ type: 'offer', sdp: payload.sdp });
      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);
      return { type: 'answer', sdp: answer.sdp };
    }
    if (payload.type === 'answer') {
      await this.connection.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
      return null;
    }
    if (payload.type === 'ice') {
      await this.connection.addIceCandidate(payload.candidate as IceCandidateInit);
    }
    return null;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  isMuted(): boolean {
    return this.muted;
  }

  stop(): void {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.connection?.close();
    this.connection = null;
    if (this.remoteAudio) {
      this.remoteAudio.srcObject = null;
      this.remoteAudio = null;
    }
  }
}
