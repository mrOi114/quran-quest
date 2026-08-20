import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useI18n } from '@/i18n';

import {
  getQisasAudioStatus,
  getQisasAudioUrl,
  isQisasAudioPlaying,
  maintainQisasBackgroundPlayback,
  pauseQisasAudio,
  playQisasAudio,
  resumeQisasAudio,
  seekQisasAudio,
  stopQisasAudio,
  type QisasAudioMetadata,
  type QisasAudioStatus,
} from '../services/qisasAudioPlayer';

type UseQisasAudioOptions = {
  audioUrl: string | null;
  metadata?: QisasAudioMetadata;
  startAt?: number;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
  onStatus?: (status: QisasAudioStatus) => void;
};

export function useQisasAudio({
  audioUrl,
  metadata,
  startAt = 0,
  autoPlay = false,
  onPlaybackComplete,
  onStatus,
}: UseQisasAudioOptions) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<QisasAudioStatus>({
    playing: false,
    currentTime: 0,
    duration: 0,
    url: null,
  });
  const audioUrlRef = useRef(audioUrl);
  const metadataRef = useRef(metadata);
  const startAtRef = useRef(startAt);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);
  const onStatusRef = useRef(onStatus);
  const ownedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);
  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);
  useEffect(() => {
    startAtRef.current = startAt;
  }, [startAt]);
  useEffect(() => {
    onPlaybackCompleteRef.current = onPlaybackComplete;
  }, [onPlaybackComplete]);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  const applyStatus = useCallback((next: QisasAudioStatus) => {
    setStatus(next);
    setIsPlaying(next.playing);
    onStatusRef.current?.(next);
  }, []);

  const startPlayback = useCallback(async () => {
    const url = audioUrlRef.current;
    if (!url) {
      setError(t('qisas.audioComingSoon'));
      return;
    }
    setError(null);
    try {
      await playQisasAudio(
        url,
        {
          onEnded: () => {
            setIsPlaying(false);
            onPlaybackCompleteRef.current?.();
          },
          onError: () => {
            setIsPlaying(false);
            setError(t('audio.error'));
          },
          onPlayingChange: (playing) => setIsPlaying(playing),
          onStatus: applyStatus,
        },
        metadataRef.current,
        { startAt: startAtRef.current },
      );
    } catch {
      setIsPlaying(false);
      setError(t('audio.error'));
    }
  }, [applyStatus, t]);

  useEffect(() => {
    const previousOwned = ownedUrlRef.current;
    ownedUrlRef.current = audioUrl;
    if (!audioUrl) {
      if (previousOwned && getQisasAudioUrl() === previousOwned) {
        void stopQisasAudio();
      }
      setIsPlaying(false);
      return;
    }
    if (autoPlay) {
      void startPlayback();
    }
  }, [audioUrl, autoPlay, startPlayback]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        maintainQisasBackgroundPlayback();
        return;
      }
      if (next === 'active') {
        applyStatus(getQisasAudioStatus());
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [applyStatus]);

  useEffect(() => {
    return () => {
      const owned = ownedUrlRef.current;
      if (owned && getQisasAudioUrl() === owned) {
        void stopQisasAudio();
      }
    };
  }, []);

  const play = useCallback(async () => {
    const url = audioUrlRef.current;
    if (url && getQisasAudioUrl() === url && !isQisasAudioPlaying()) {
      const resumed = await resumeQisasAudio(metadataRef.current);
      if (resumed) {
        setIsPlaying(true);
        setError(null);
        return;
      }
    }
    await startPlayback();
  }, [startPlayback]);

  const pause = useCallback(async () => {
    await pauseQisasAudio();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(async () => {
    await stopQisasAudio();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback(
    async (seconds: number) => {
      await seekQisasAudio(seconds);
      applyStatus(getQisasAudioStatus());
    },
    [applyStatus],
  );

  return {
    isPlaying,
    error,
    status,
    play,
    pause,
    stop,
    seekTo,
    clearError: () => setError(null),
  };
}
