import { useCallback, useEffect, useRef, useState } from 'react';

import type { AudioRepeatCount } from '@/types';

import {
  pauseVerseAudio,
  playVerseAudio,
  stopVerseAudio,
} from '../services/audioPlayerService';

type UseVerseAudioOptions = {
  audioUrl: string | null;
  repeatCount: AudioRepeatCount;
  onPlayedOnce?: () => void;
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
  onPlayedOnce,
}: UseVerseAudioOptions): UseVerseAudioResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remainingRef = useRef(0);
  const audioUrlRef = useRef(audioUrl);
  const repeatCountRef = useRef(repeatCount);
  const onPlayedOnceRef = useRef(onPlayedOnce);
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
    onPlayedOnceRef.current = onPlayedOnce;
  }, [onPlayedOnce]);

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
        await playVerseAudio(url, {
          onEnded: () => {
            remainingRef.current -= 1;
            if (remainingRef.current > 0) {
              void startPlaybackRef.current(false);
              return;
            }
            setIsPlaying(false);
          },
          onError: (message) => {
            setIsPlaying(false);
            setError(message);
          },
        });
      } catch {
        setIsPlaying(false);
        setError('Audio could not play. Try again.');
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      void stopVerseAudio();
    };
  }, []);

  const play = useCallback(async () => {
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
