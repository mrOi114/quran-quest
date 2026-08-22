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
  getQuranListenKind,
  handleQuranListenEnded,
  isQuranListenEnabled,
  pauseQuranListen,
  registerQuranListenEngine,
  resumeQuranListenIntent,
  setQuranListenRepeat,
  syncQuranListenCursor,
  type QuranListenCursor,
  type QuranListenKind,
} from './quranListenQueue';

export type VerseAudioMetadata = BackgroundAudioMetadata;
export type VerseAudioStatus = BackgroundAudioStatus;

type PlaybackCallbacks = BackgroundAudioCallbacks;

export type PlayVerseAudioOptions = PlayBackgroundAudioOptions & {
  continuous?: boolean;
  cursor?: QuranListenCursor;
  repeatCount?: AudioRepeatCount;
  resetRemaining?: boolean;
  kind?: QuranListenKind;
};

const quranSession = createBackgroundAudioSession({
  defaultTitle: 'Qur’an',
  defaultArtist: 'Mahmoud Khalil Al-Husary',
  defaultAlbum: 'QuranFamily',
});

const meaningSession = createBackgroundAudioSession({
  defaultTitle: 'Somali Qur’an Meaning Audio',
  defaultArtist: 'Cabdullaahi Xasan Yacquub',
  defaultAlbum: 'QuranEnc.com',
});

function sessionFor(kind: QuranListenKind) {
  return kind === 'meaning' ? meaningSession : quranSession;
}

function channelFor(kind: QuranListenKind) {
  return kind === 'meaning' ? 'meaning' : 'quran';
}

function activeKind(): QuranListenKind {
  if (meaningSession.getUrl() && (meaningSession.wantsPlayback() || meaningSession.isPlaying())) {
    return 'meaning';
  }
  if (quranSession.getUrl() && (quranSession.wantsPlayback() || quranSession.isPlaying())) {
    return 'quran';
  }
  return getQuranListenKind();
}

function activeSession() {
  return sessionFor(activeKind());
}

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
    sessionFor(getQuranListenKind()).playImmediate(
      url,
      mergedCallbacks(uiCallbacks),
      metadata,
    );
  },
  stop: () => sessionFor(getQuranListenKind()).stop(),
});

registerExclusivePause('quran', () => quranSession.pause());
registerExclusivePause('meaning', () => meaningSession.pause());

export function maintainBackgroundPlayback(): void {
  quranSession.maintainBackground();
  meaningSession.maintainBackground();
}

export function isVerseAudioPlaying(): boolean {
  return quranSession.isPlaying() || meaningSession.isPlaying();
}

export function getVerseAudioUrl(): string | null {
  return activeSession().getUrl() ?? quranSession.getUrl() ?? meaningSession.getUrl();
}

export function getVerseAudioStatus(): BackgroundAudioStatus {
  return activeSession().getStatus();
}

export function verseAudioWantsPlayback(): boolean {
  return quranSession.wantsPlayback() || meaningSession.wantsPlayback();
}

export async function seekVerseAudio(seconds: number): Promise<void> {
  await activeSession().seekTo(seconds);
}

export async function stopVerseAudio(): Promise<void> {
  disableQuranListen();
  await quranSession.stop();
  await meaningSession.stop();
}

export async function playVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
  metadata?: VerseAudioMetadata,
  options?: PlayVerseAudioOptions,
): Promise<void> {
  const kind = options?.kind ?? 'quran';
  await exclusiveAcquire(channelFor(kind));
  if (kind === 'meaning') {
    await quranSession.stop();
  } else {
    await meaningSession.stop();
  }
  if (options?.cursor) {
    enableQuranListen(options.cursor, options.repeatCount ?? '1', {
      resetRemaining: options.resetRemaining,
      kind,
      advance: Boolean(options.continuous),
    });
  } else {
    disableQuranListen();
  }
  await sessionFor(kind).play(url, mergedCallbacks(callbacks), metadata, options);
}

export async function pauseVerseAudio(): Promise<void> {
  pauseQuranListen();
  await quranSession.pause();
  await meaningSession.pause();
}

export async function resumeVerseAudio(
  metadata?: VerseAudioMetadata,
): Promise<boolean> {
  const kind = activeKind();
  await exclusiveAcquire(channelFor(kind));
  resumeQuranListenIntent();
  return sessionFor(kind).resume(metadata);
}

export async function replayVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
  metadata?: VerseAudioMetadata,
  kind: QuranListenKind = 'quran',
): Promise<void> {
  await exclusiveAcquire(channelFor(kind));
  await sessionFor(kind).replay(url, mergedCallbacks(callbacks), metadata);
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
