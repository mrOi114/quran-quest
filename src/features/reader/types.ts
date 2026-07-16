import type { AgeGroupId } from '@/features/auth';
import type { AudioRepeatCount } from '@/types';

export type ReaderMode = 'lesson' | 'browse' | 'practice';

/**
 * Optional display size override.
 * V1 Feature 005 keeps Arabic size age-derived (`null`); column reserved for later.
 * Never changes Uthmani text content.
 */
export type ReaderFontScale = 'default' | 'large' | 'xlarge';

/**
 * Future-ready Reader settings (architecture only — no UI in Feature 005).
 * `null` / omitted means unset and may be filled by guest→cloud empty-only merge later.
 */
export type ReaderFutureSettings = {
  /** When true, advance to next ayah after playback ends (browse). */
  autoPlayNextVerse: boolean | null;
  /** Playback rate; null means platform default (1.0). */
  playbackSpeed: number | null;
  /** Visual mushaf presentation preference; Arabic source remains Uthmani. */
  mushafStyle: 'uthmani_standard' | 'indopak' | null;
  /** Reader chrome color scheme; null follows system / app theme. */
  nightMode: 'system' | 'light' | 'dark' | null;
};

export type ReaderPreferences = {
  showTranslation: boolean;
  repeatCount: AudioRepeatCount;
  preferredReciterKey: string;
  preferredTranslationId: string | null;
  /** Always null in V1 UI paths — age-derived sizing. Reserved for future. */
  fontScale: ReaderFontScale | null;
  futureSettings: ReaderFutureSettings;
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
  futureSettings: ReaderFutureSettings | null;
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
