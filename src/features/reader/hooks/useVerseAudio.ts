import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useI18n } from '@/i18n';
import type { AudioRepeatCount } from '@/types';

import {
  getVerseAudioStatus,
  getVerseAudioUrl,
  isVerseAudioPlaying,
  maintainBackgroundPlayback,
  pauseVerseAudio,
  playVerseAudio,
  resumeVerseAudio,
  seekVerseAudio,
  stopVerseAudio,
  verseAudioWantsPlayback,
  type VerseAudioMetadata,
  type VerseAudioStatus,
} from '../services/audioPlayerService';
import type { QuranListenCursor } from '../services/quranListenQueue';
import { isQuranListenPaused } from '../services/quranListenQueue';

type UseVerseAudioOptions = {
  audioUrl: string | null;
  repeatCount: AudioRepeatCount;
  metadata?: VerseAudioMetadata;
  onPlayedOnce?: () => void;
  /** Fires after the configured repeat cycle finishes (not on pause). */
  onPlaybackComplete?: () => void;
  /** Start playback automatically when a URL is ready (listen mode). */
  autoPlay?: boolean;
  /** Shared continuous Qur’an listen (ayah → ayah → surah). */
  continuous?: boolean;
  cursor?: QuranListenCursor;
};

type UseVerseAudioResult = {
  isPlaying: boolean;
  hasPlayedOnce: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  replay: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  clearError: () => void;
};

function initialPlaysForRepeat(repeatCount: AudioRepeatCount): number {
  if (repeatCount === 'loop') {
    return Number.POSITIVE_INFINITY;
  }
  if (repeatCount === '3') {
    return 3;
  }
  return 1;
}

export function useVerseAudio({
  audioUrl,
  repeatCount,
  metadata,
  onPlayedOnce,
  onPlaybackComplete,
  autoPlay = false,
  continuous = false,
  cursor,
}: UseVerseAudioOptions): UseVerseAudioResult {
  const { t } = useI18n();
  const audioError = t('audio.error');
  const audioErrorRef = useRef(audioError);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VerseAudioStatus>({
    playing: false,
    currentTime: 0,
    duration: 0,
    url: null,
  });
  const remainingRef = useRef(0);
  const ownedUrlRef = useRef<string | null>(null);
  const audioUrlRef = useRef(audioUrl);
  const repeatCountRef = useRef(repeatCount);
  const metadataRef = useRef(metadata);
  const onPlayedOnceRef = useRef(onPlayedOnce);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);
  const continuousRef = useRef(continuous);
  const cursorRef = useRef(cursor);
  const startPlaybackRef = useRef<(resetRemaining: boolean) => Promise<void>>(
    async () => undefined,
  );

  useEffect(() => {
    audioErrorRef.current = audioError;
  }, [audioError]);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    repeatCountRef.current = repeatCount;
  }, [repeatCount]);

  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);

  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    onPlayedOnceRef.current = onPlayedOnce;
  }, [onPlayedOnce]);

  useEffect(() => {
    onPlaybackCompleteRef.current = onPlaybackComplete;
  }, [onPlaybackComplete]);

  useEffect(() => {
    startPlaybackRef.current = async (resetRemaining: boolean) => {
      const url = audioUrlRef.current;
      if (!url) {
        setError(audioErrorRef.current);
        return;
      }

      if (resetRemaining) {
        remainingRef.current = initialPlaysForRepeat(repeatCountRef.current);
      }

      setError(null);
      setIsPlaying(true);
      setHasPlayedOnce(true);
      onPlayedOnceRef.current?.();

      try {
        await playVerseAudio(
          url,
          {
            onEnded: () => {
              remainingRef.current -= 1;
              if (remainingRef.current > 0) {
                void startPlaybackRef.current(false);
                return;
              }
              setIsPlaying(false);
              onPlaybackCompleteRef.current?.();
            },
            onError: () => {
              setIsPlaying(false);
              setError(audioErrorRef.current);
            },
            onPlayingChange: (playing) => {
              setIsPlaying(playing);
            },
            onStatus: (next) => {
              setStatus(next);
              setIsPlaying(next.playing);
            },
          },
          metadataRef.current,
          continuousRef.current && cursorRef.current
            ? {
                continuous: true,
                cursor: cursorRef.current,
                repeatCount: repeatCountRef.current,
              }
            : undefined,
        );
      } catch {
        setIsPlaying(false);
        setError(audioErrorRef.current);
      }
    };
  }, []);

  // Do NOT stop on unmount — background playback and ayah auto-advance
  // remounts must keep the native player / foreground media service alive.
  // Only stop the shared player when THIS hook owned the current URL and it
  // was explicitly cleared (audio off / no source), not when another screen
  // mounts with a null URL.
  useEffect(() => {
    const previousOwned = ownedUrlRef.current;
    ownedUrlRef.current = audioUrl;

    if (!audioUrl) {
      if (previousOwned && getVerseAudioUrl() === previousOwned) {
        void stopVerseAudio();
      }
      setIsPlaying(false);
      return;
    }
    if (!autoPlay) {
      return;
    }
    if (isQuranListenPaused()) {
      setIsPlaying(false);
      return;
    }
    if (
      getVerseAudioUrl() === audioUrl &&
      (isVerseAudioPlaying() || verseAudioWantsPlayback())
    ) {
      setIsPlaying(true);
      return;
    }
    void startPlaybackRef.current(true);
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        maintainBackgroundPlayback();
        return;
      }
      if (next === 'active') {
        const nextStatus = getVerseAudioStatus();
        setStatus(nextStatus);
        setIsPlaying(nextStatus.playing);
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      sub.remove();
    };
  }, []);

  const play = useCallback(async () => {
    const url = audioUrlRef.current;
    if (
      url &&
      getVerseAudioUrl() === url &&
      !isVerseAudioPlaying() &&
      remainingRef.current > 0
    ) {
      const resumed = await resumeVerseAudio(metadataRef.current);
      if (resumed) {
        setIsPlaying(true);
        setError(null);
        return;
      }
    }
    await startPlaybackRef.current(true);
  }, []);

  const pause = useCallback(async () => {
    await pauseVerseAudio();
    setIsPlaying(false);
  }, []);

  const replay = useCallback(async () => {
    await startPlaybackRef.current(true);
  }, []);

  const stop = useCallback(async () => {
    remainingRef.current = 0;
    await stopVerseAudio();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    await seekVerseAudio(seconds);
    setStatus(getVerseAudioStatus());
  }, []);

  return {
    isPlaying,
    hasPlayedOnce,
    error,
    currentTime: status.currentTime,
    duration: status.duration,
    play,
    pause,
    replay,
    stop,
    seekTo,
    clearError: () => setError(null),
  };
}
