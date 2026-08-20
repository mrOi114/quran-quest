import {
  createBackgroundAudioSession,
  exclusiveAcquire,
  registerExclusivePause,
  type BackgroundAudioCallbacks,
  type BackgroundAudioMetadata,
  type BackgroundAudioStatus,
  type PlayBackgroundAudioOptions,
} from '@/features/audio';
import type { AudioRepeatCount } from '@/types';

import {
  disableQuranListen,
  enableQuranListen,
  handleQuranListenEnded,
  isQuranListenEnabled,
  pauseQuranListen,
  registerQuranListenEngine,
  resumeQuranListenIntent,
  setQuranListenRepeat,
  syncQuranListenCursor,
  type QuranListenCursor,
} from './quranListenQueue';

export type VerseAudioMetadata = BackgroundAudioMetadata;
export type VerseAudioStatus = BackgroundAudioStatus;

type PlaybackCallbacks = BackgroundAudioCallbacks;

export type PlayVerseAudioOptions = PlayBackgroundAudioOptions & {
  continuous?: boolean;
  cursor?: QuranListenCursor;
  repeatCount?: AudioRepeatCount;
};

const quranSession = createBackgroundAudioSession({
  defaultTitle: 'Qur’an',
  defaultArtist: 'Mahmoud Khalil Al-Husary',
  defaultAlbum: 'QuranFamily',
});

let uiCallbacks: PlaybackCallbacks = {};

function mergedCallbacks(ui: PlaybackCallbacks): PlaybackCallbacks {
  uiCallbacks = ui;
  return {
    onEnded: () => {
      if (handleQuranListenEnded()) {
        return true;
      }
      ui.onEnded?.();
      return false;
    },
    onError: (message) => {
      ui.onError?.(message);
    },
    onPlayingChange: (playing) => {
      ui.onPlayingChange?.(playing);
    },
    onStatus: (status) => {
      ui.onStatus?.(status);
    },
  };
}

registerQuranListenEngine({
  playImmediate: (url, metadata) => {
    quranSession.playImmediate(url, mergedCallbacks(uiCallbacks), metadata);
  },
  stop: () => quranSession.stop(),
});

registerExclusivePause('quran', () => quranSession.pause());

export function maintainBackgroundPlayback(): void {
  quranSession.maintainBackground();
}

export function isVerseAudioPlaying(): boolean {
  return quranSession.isPlaying();
}

export function getVerseAudioUrl(): string | null {
  return quranSession.getUrl();
}

export function getVerseAudioStatus(): BackgroundAudioStatus {
  return quranSession.getStatus();
}

export function verseAudioWantsPlayback(): boolean {
  return quranSession.wantsPlayback();
}

export async function seekVerseAudio(seconds: number): Promise<void> {
  await quranSession.seekTo(seconds);
}

export async function stopVerseAudio(): Promise<void> {
  disableQuranListen();
  await quranSession.stop();
}

export async function playVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
  metadata?: VerseAudioMetadata,
  options?: PlayVerseAudioOptions,
): Promise<void> {
  await exclusiveAcquire('quran');
  if (options?.continuous && options.cursor) {
    enableQuranListen(options.cursor, options.repeatCount ?? '1');
  } else {
    disableQuranListen();
  }
  await quranSession.play(url, mergedCallbacks(callbacks), metadata, options);
}

export async function pauseVerseAudio(): Promise<void> {
  pauseQuranListen();
  await quranSession.pause();
}

export async function resumeVerseAudio(
  metadata?: VerseAudioMetadata,
): Promise<boolean> {
  await exclusiveAcquire('quran');
  resumeQuranListenIntent();
  return quranSession.resume(metadata);
}

export async function replayVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
  metadata?: VerseAudioMetadata,
): Promise<void> {
  await exclusiveAcquire('quran');
  await quranSession.replay(url, mergedCallbacks(callbacks), metadata);
}

export function syncVerseAudioPlayingState(): boolean {
  return isVerseAudioPlaying();
}

export function setContinuousListenRepeat(repeatCount: AudioRepeatCount): void {
  setQuranListenRepeat(repeatCount);
}

export function syncContinuousListenCursor(cursor: QuranListenCursor): void {
  if (isQuranListenEnabled()) {
    syncQuranListenCursor(cursor);
  }
}
