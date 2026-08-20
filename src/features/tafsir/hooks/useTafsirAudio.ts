import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useI18n } from '@/i18n';

import {
  getTafsirAudioStatus,
  getTafsirAudioUrl,
  isTafsirAudioPlaying,
  maintainTafsirBackgroundPlayback,
  pauseTafsirAudio,
  playTafsirAudio,
  resumeTafsirAudio,
  seekTafsirAudio,
  stopTafsirAudio,
  type TafsirAudioMetadata,
  type TafsirAudioStatus,
} from '../services/tafsirAudioPlayer';

type UseTafsirAudioOptions = {
  audioUrl: string | null;
  metadata?: TafsirAudioMetadata;
  startAt?: number;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
  onStatus?: (status: TafsirAudioStatus) => void;
};

export function useTafsirAudio({
  audioUrl,
  metadata,
  startAt = 0,
  autoPlay = false,
  onPlaybackComplete,
  onStatus,
}: UseTafsirAudioOptions) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TafsirAudioStatus>({
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

  const applyStatus = useCallback((next: TafsirAudioStatus) => {
    setStatus(next);
    setIsPlaying(next.playing);
    onStatusRef.current?.(next);
  }, []);

  const startPlayback = useCallback(async () => {
    const url = audioUrlRef.current;
    if (!url) {
      setError(t('tafsir.audioUnavailable'));
      return;
    }
    setError(null);
    try {
      await playTafsirAudio(
        url,
        {
          onEnded: () => {
            setIsPlaying(false);
            onPlaybackCompleteRef.current?.();
          },
          onError: () => {
            setIsPlaying(false);
            setError(t('tafsir.audioUnavailable'));
          },
          onPlayingChange: (playing) => setIsPlaying(playing),
          onStatus: applyStatus,
        },
        metadataRef.current,
        { startAt: startAtRef.current },
      );
    } catch {
      setIsPlaying(false);
      setError(t('tafsir.audioUnavailable'));
    }
  }, [applyStatus, t]);

  useEffect(() => {
    const previousOwned = ownedUrlRef.current;
    ownedUrlRef.current = audioUrl;
    if (!audioUrl) {
      if (previousOwned && getTafsirAudioUrl() === previousOwned) {
        void stopTafsirAudio();
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
        maintainTafsirBackgroundPlayback();
        return;
      }
      if (next === 'active') {
        applyStatus(getTafsirAudioStatus());
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [applyStatus]);

  const play = useCallback(async () => {
    const url = audioUrlRef.current;
    if (url && getTafsirAudioUrl() === url && !isTafsirAudioPlaying()) {
      const resumed = await resumeTafsirAudio(metadataRef.current);
      if (resumed) {
        setIsPlaying(true);
        setError(null);
        return;
      }
    }
    await startPlayback();
  }, [startPlayback]);

  const pause = useCallback(async () => {
    await pauseTafsirAudio();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(async () => {
    await stopTafsirAudio();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    await seekTafsirAudio(seconds);
    applyStatus(getTafsirAudioStatus());
  }, [applyStatus]);

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
