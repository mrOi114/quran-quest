import type { AudioRepeatCount } from '@/types';

import { DEFAULT_RECITER_KEY } from '../constants';
import { getMushafSurah, resolveMushafVerseAudio } from '../content';
import {
  getSomaliYacobAudioUrl,
  somaliYacobAudioMetadata,
} from '../content/somaliYacobAudio';

export type QuranListenKind = 'quran' | 'meaning';

export type QuranListenCursor = {
  surahNumber: number;
  ayahNumber: number;
};

export type QuranListenSnapshot = QuranListenCursor & {
  url: string | null;
  completed: boolean;
};

type ListenEngine = {
  playImmediate: (
    url: string,
    metadata: { title: string; artist: string; albumTitle: string },
  ) => void;
  stop: () => Promise<void>;
};

const LAST_SURAH = 114;

let engine: ListenEngine | null = null;
let enabled = false;
let pausedByUser = false;
let listenKind: QuranListenKind = 'quran';
let cursor: QuranListenCursor = { surahNumber: 1, ayahNumber: 1 };
let remainingPlays = 1;
let repeatCount: AudioRepeatCount = '1';
let completed = false;
const listeners = new Set<(snapshot: QuranListenSnapshot) => void>();

function playsFor(count: AudioRepeatCount): number {
  if (count === 'loop') {
    return Number.POSITIVE_INFINITY;
  }
  if (count === '3') {
    return 3;
  }
  return 1;
}

function verseId(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

export function resolveQuranListenUrl(
  surahNumber: number,
  ayahNumber: number,
  kind: QuranListenKind = listenKind,
): string | null {
  if (kind === 'meaning') {
    return getSomaliYacobAudioUrl(surahNumber, ayahNumber);
  }
  return (
    resolveMushafVerseAudio(verseId(surahNumber, ayahNumber), DEFAULT_RECITER_KEY)?.audioUrl ??
    null
  );
}

export function nextQuranListenCursor(
  surahNumber: number,
  ayahNumber: number,
): QuranListenCursor | null {
  const surah = getMushafSurah(surahNumber);
  if (!surah) {
    return null;
  }
  if (ayahNumber < surah.ayahCount) {
    return { surahNumber, ayahNumber: ayahNumber + 1 };
  }
  if (surahNumber >= LAST_SURAH) {
    return null;
  }
  return { surahNumber: surahNumber + 1, ayahNumber: 1 };
}

export function previousQuranListenCursor(
  surahNumber: number,
  ayahNumber: number,
): QuranListenCursor | null {
  if (ayahNumber > 1) {
    return { surahNumber, ayahNumber: ayahNumber - 1 };
  }
  if (surahNumber <= 1) {
    return null;
  }
  const previous = getMushafSurah(surahNumber - 1);
  if (!previous) {
    return null;
  }
  return { surahNumber: previous.number, ayahNumber: previous.ayahCount };
}

export function quranListenMetadata(
  position: QuranListenCursor,
  kind: QuranListenKind = listenKind,
) {
  if (kind === 'meaning') {
    return somaliYacobAudioMetadata(position.surahNumber, position.ayahNumber);
  }
  return {
    title: `Surah ${position.surahNumber} · Ayah ${position.ayahNumber}`,
    artist: 'Mahmoud Khalil Al-Husary',
    albumTitle: 'QuranFamily',
  };
}

function snapshot(): QuranListenSnapshot {
  return {
    surahNumber: cursor.surahNumber,
    ayahNumber: cursor.ayahNumber,
    url: resolveQuranListenUrl(cursor.surahNumber, cursor.ayahNumber, listenKind),
    completed,
  };
}

function emit(): void {
  const next = snapshot();
  listeners.forEach((listener) => listener(next));
}

function playCursor(): boolean {
  const url = resolveQuranListenUrl(cursor.surahNumber, cursor.ayahNumber, listenKind);
  if (!url || !engine) {
    return false;
  }
  completed = false;
  engine.playImmediate(url, quranListenMetadata(cursor, listenKind));
  emit();
  return true;
}

export function registerQuranListenEngine(next: ListenEngine): void {
  engine = next;
}

export function subscribeQuranListen(
  listener: (snapshot: QuranListenSnapshot) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isQuranListenEnabled(): boolean {
  return enabled;
}

export function isQuranListenPaused(): boolean {
  return enabled && pausedByUser;
}

export function getQuranListenSnapshot(): QuranListenSnapshot {
  return snapshot();
}

export function getQuranListenKind(): QuranListenKind {
  return listenKind;
}

export function enableQuranListen(
  position: QuranListenCursor,
  nextRepeatCount: AudioRepeatCount,
  options?: { resetRemaining?: boolean; kind?: QuranListenKind },
): void {
  enabled = true;
  pausedByUser = false;
  completed = false;
  if (options?.kind) {
    listenKind = options.kind;
  }
  const sameCursor =
    cursor.surahNumber === position.surahNumber &&
    cursor.ayahNumber === position.ayahNumber;
  cursor = position;
  repeatCount = nextRepeatCount;
  if (!(options?.resetRemaining === false && sameCursor && remainingPlays > 0)) {
    remainingPlays = playsFor(nextRepeatCount);
  }
  emit();
}

export function setQuranListenRepeat(nextRepeatCount: AudioRepeatCount): void {
  repeatCount = nextRepeatCount;
}

export function syncQuranListenCursor(position: QuranListenCursor): void {
  if (
    cursor.surahNumber === position.surahNumber &&
    cursor.ayahNumber === position.ayahNumber
  ) {
    return;
  }
  cursor = position;
  remainingPlays = playsFor(repeatCount);
  completed = false;
  emit();
}

export function pauseQuranListen(): void {
  if (!enabled) {
    return;
  }
  pausedByUser = true;
}

export function resumeQuranListenIntent(): void {
  if (!enabled) {
    return;
  }
  pausedByUser = false;
  completed = false;
}

export function disableQuranListen(): void {
  enabled = false;
  pausedByUser = false;
  remainingPlays = 0;
}

/** @returns true when this ended event was consumed by continuous listen. */
export function handleQuranListenEnded(): boolean {
  if (!enabled || pausedByUser) {
    return false;
  }

  remainingPlays -= 1;
  if (remainingPlays > 0) {
    return playCursor();
  }

  const next = nextQuranListenCursor(cursor.surahNumber, cursor.ayahNumber);
  if (!next) {
    completed = true;
    enabled = false;
    remainingPlays = 0;
    emit();
    void engine?.stop();
    return true;
  }

  cursor = next;
  remainingPlays = playsFor(repeatCount);
  return playCursor();
}
