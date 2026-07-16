import type { AgeGroupId } from '@/features/auth';
import type { AudioRepeatCount } from '@/types';

export type ReaderMode = 'lesson' | 'browse' | 'practice';

/** Optional Arabic size override; null means age-group default. Never changes Uthmani text. */
export type ReaderFontScale = 'default' | 'large' | 'xlarge';

export type ReaderPreferences = {
  showTranslation: boolean;
  repeatCount: AudioRepeatCount;
  preferredReciterKey: string;
  preferredTranslationId: string | null;
  fontScale: ReaderFontScale | null;
};

/**
 * Cloud preference snapshot for field-by-field empty-only merge.
 * `null` / empty string on a field means that field is empty and may take the guest value.
 * `rowExists: false` means every field is empty.
 */
export type CloudReaderPreferenceFields = {
  rowExists: boolean;
  showTranslation: boolean | null;
  repeatCount: AudioRepeatCount | null;
  preferredReciterKey: string | null;
  preferredTranslationId: string | null;
  fontScale: ReaderFontScale | null;
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
