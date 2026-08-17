import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { AudioRepeatCount } from '@/types';

import {
  getVerseAudioUrl,
  isVerseAudioPlaying,
  pauseVerseAudio,
  playVerseAudio,
  resumeVerseAudio,
  stopVerseAudio,
  type VerseAudioMetadata,
} from '../services/audioPlayerService';

type UseVerseAudioOptions = {
  audioUrl: string | null;
  repeatCount: AudioRepeatCount;
  metadata?: VerseAudioMetadata;
  onPlayedOnce?: () => void;
  /** Fires after the configured repeat cycle finishes (not on pause). */
  onPlaybackComplete?: () => void;
  /** Start playback automatically when a URL is ready (listen mode). */
  autoPlay?: boolean;
};

type UseVerseAudioResult = {
  isPlaying: boolean;
  hasPlayedOnce: boolean;
  error: string | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  replay: () => Promise<void>;
  stop: () => Promise<void>;
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
}: UseVerseAudioOptions): UseVerseAudioResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remainingRef = useRef(0);
  const audioUrlRef = useRef(audioUrl);
  const repeatCountRef = useRef(repeatCount);
  const metadataRef = useRef(metadata);
  const onPlayedOnceRef = useRef(onPlayedOnce);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);
  const startPlaybackRef = useRef<(resetRemaining: boolean) => Promise<void>>(
    async () => undefined,
  );

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
    onPlayedOnceRef.current = onPlayedOnce;
  }, [onPlayedOnce]);

  useEffect(() => {
    onPlaybackCompleteRef.current = onPlaybackComplete;
  }, [onPlaybackComplete]);

  useEffect(() => {
    startPlaybackRef.current = async (resetRemaining: boolean) => {
      const url = audioUrlRef.current;
      if (!url) {
        setError('Audio could not play. Try again.');
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
            onError: (message) => {
              setIsPlaying(false);
              setError(message);
            },
            onPlayingChange: (playing) => {
              setIsPlaying(playing);
            },
          },
          metadataRef.current,
        );
      } catch {
        setIsPlaying(false);
        setError('Audio could not play. Try again.');
      }
    };
  }, []);

  // Do NOT stop on unmount — background playback and ayah auto-advance
  // remounts must keep the native player / foreground media service alive.
  useEffect(() => {
    if (!audioUrl) {
      if (getVerseAudioUrl()) {
        void stopVerseAudio();
      }
      setIsPlaying(false);
      return;
    }
    if (!autoPlay) {
      return;
    }
    void startPlaybackRef.current(true);
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        setIsPlaying(isVerseAudioPlaying());
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

  return {
    isPlaying,
    hasPlayedOnce,
    error,
    play,
    pause,
    replay,
    stop,
    clearError: () => setError(null),
  };
}
