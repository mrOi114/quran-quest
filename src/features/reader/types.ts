import type { AgeGroupId } from '@/features/auth';
import type { AudioRepeatCount } from '@/types';

export type ReaderMode = 'lesson' | 'browse' | 'practice';

export type ReaderPreferences = {
  showTranslation: boolean;
  repeatCount: AudioRepeatCount;
  preferredReciterKey: string;
  preferredTranslationId: string | null;
};

export type ReaderBrowseState = {
  lastSurahNumber: number;
  lastAyahNumber: number;
};

export type ResolvedVerseMeaning = {
  text: string;
  languageCode: string;
  translationId: string;
  sourceLabel: string;
  isFallback: boolean;
};

export type ReaderVerseViewModel = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  meaning: ResolvedVerseMeaning | null;
  explanation: string | null;
  audioUrl: string | null;
  reciterKey: string;
  isLearned: boolean;
};

export type BrowsableSurah = {
  number: number;
  nameArabic: string;
  nameLatin: string;
  ayahCount: number;
  maxBrowsableAyah: number;
  isFullyUnlocked: boolean;
};

export type BrowseSession = {
  surah: BrowsableSurah;
  verses: ReaderVerseViewModel[];
  activeAyahNumber: number;
  ageGroup: AgeGroupId;
};
