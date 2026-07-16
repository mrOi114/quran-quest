/**
 * Supabase Database types for Features 001–005.
 * Regenerate with `supabase gen types typescript` when the remote schema changes.
 */
export type Json =
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = 'adult' | 'parent' | 'child';

export type ContentApprovalStatus = 'draft' | 'approved' | 'retired';
export type VerseLearningStatus = 'not_started' | 'in_progress' | 'learned' | 'mastered';
export type RevisionStatus = 'none' | 'due' | 'ok';
export type SurahLearningStatus = 'not_started' | 'in_progress' | 'completed';
export type LearningEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'verse_marked_learned'
  | 'verse_reviewed'
  | 'recitation_attempt';

export type Profile = {
  id: string;
  role: ProfileRole;
  email: string | null;
  display_name: string;
  age: number | null;
  avatar_key: string;
  country_code: string;
  preferred_language: string;
  parent_id: string | null;
  pin_hash: string | null;
  pin_failed_attempts: number;
  pin_locked_until: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovedDevice = {
  id: string;
  parent_id: string;
  device_key: string;
  label: string;
  created_at: string;
};

export type Juz = {
  number: number;
  name: string;
  surah_start: number;
  surah_end: number;
};

export type Surah = {
  number: number;
  juz_number: number;
  name_arabic: string;
  name_latin: string;
  ayah_count: number;
  revelation_type: string | null;
  sort_order: number;
};

export type Reciter = {
  key: string;
  name: string;
  style: string | null;
  audio_base_url: string;
  is_default_beginner: boolean;
  created_at: string;
};

export type AudioAsset = {
  key: string;
  reciter_key: string;
  url: string;
  format: string;
  duration_ms: number | null;
  approval_status: ContentApprovalStatus;
  created_at: string;
};

export type Verse = {
  id: string;
  surah_number: number;
  ayah_number: number;
  text_uthmani: string;
  text_imlaei: string | null;
  verse_order_global: number;
  audio_asset_key: string | null;
  content_version: number;
  content_hash: string;
  created_at: string;
  updated_at: string;
};

export type VerseTajweed = {
  verse_id: string;
  schema_version: number;
  tokens: Json;
  approval_status: ContentApprovalStatus;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Translation = {
  id: string;
  language_code: string;
  name: string;
  source: string;
  approval_status: ContentApprovalStatus;
  created_at: string;
};

export type VerseTranslation = {
  verse_id: string;
  translation_id: string;
  text: string;
  approval_status: ContentApprovalStatus;
  approved_at: string | null;
  content_version: number;
  created_at: string;
  updated_at: string;
};

export type ContentManifest = {
  id: string;
  juz_number: number;
  content_version: number;
  corpus_hash: string;
  arabic_source: string;
  notes: string | null;
  created_at: string;
};

export type LessonOverride = {
  id: string;
  surah_number: number;
  age_group: string;
  start_ayah: number;
  end_ayah: number;
  lesson_index: number;
};

export type LearnerLearningState = {
  learner_id: string;
  current_surah_number: number;
  current_ayah_number: number;
  current_lesson_key: string;
  age_group_snapshot: string;
  updated_at: string;
};

export type VerseProgress = {
  learner_id: string;
  verse_id: string;
  status: VerseLearningStatus;
  learned_at: string | null;
  revision_status: RevisionStatus;
  memory_score: number | null;
  last_practiced_at: string | null;
  practice_count: number;
  created_at: string;
  updated_at: string;
};

export type SurahProgress = {
  learner_id: string;
  surah_number: number;
  verses_learned: number;
  verses_total: number;
  status: SurahLearningStatus;
  completed_at: string | null;
  updated_at: string;
};

export type LessonCompletion = {
  id: string;
  learner_id: string;
  lesson_key: string;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  age_group: string;
  completed_at: string;
};

export type LearningEvent = {
  id: string;
  learner_id: string;
  verse_id: string | null;
  lesson_key: string | null;
  event_type: LearningEventType;
  payload: Json;
  created_at: string;
};

export type AudioRepeatCount = '1' | '3' | 'loop';
export type ReaderFontScale = 'default' | 'large' | 'xlarge';

export type VerseExplanation = {
  verse_id: string;
  language_code: string;
  text: string;
  approval_status: ContentApprovalStatus;
  approved_at: string | null;
  content_version: number;
  created_at: string;
  updated_at: string;
};

export type LearnerReaderPreferences = {
  learner_id: string;
  show_translation: boolean;
  repeat_count: AudioRepeatCount;
  preferred_reciter_key: string;
  preferred_translation_id: string | null;
  font_scale: ReaderFontScale | null;
  future_settings: Json;
  updated_at: string;
};

export type LearnerReaderState = {
  learner_id: string;
  last_surah_number: number;
  last_ayah_number: number;
  updated_at: string;
};

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        {
          id?: string;
          role: ProfileRole;
          email?: string | null;
          display_name: string;
          age?: number | null;
          avatar_key?: string;
          country_code?: string;
          preferred_language?: string;
          parent_id?: string | null;
          pin_hash?: string | null;
          pin_failed_attempts?: number;
          pin_locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Profile>
      >;
      approved_devices: TableDef<
        ApprovedDevice,
        {
          id?: string;
          parent_id: string;
          device_key: string;
          label?: string;
          created_at?: string;
        },
        Partial<ApprovedDevice>
      >;
      juz: TableDef<Juz, Juz, Partial<Juz>>;
      surahs: TableDef<
        Surah,
        {
          number: number;
          juz_number: number;
          name_arabic: string;
          name_latin: string;
          ayah_count: number;
          revelation_type?: string | null;
          sort_order: number;
        },
        Partial<Surah>
      >;
      reciters: TableDef<
        Reciter,
        {
          key: string;
          name: string;
          style?: string | null;
          audio_base_url: string;
          is_default_beginner?: boolean;
          created_at?: string;
        },
        Partial<Reciter>
      >;
      audio_assets: TableDef<
        AudioAsset,
        {
          key: string;
          reciter_key: string;
          url: string;
          format?: string;
          duration_ms?: number | null;
          approval_status?: ContentApprovalStatus;
          created_at?: string;
        },
        Partial<AudioAsset>
      >;
      verses: TableDef<
        Verse,
        {
          id: string;
          surah_number: number;
          ayah_number: number;
          text_uthmani: string;
          text_imlaei?: string | null;
          verse_order_global: number;
          audio_asset_key?: string | null;
          content_version?: number;
          content_hash: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Verse>
      >;
      verse_tajweed: TableDef<
        VerseTajweed,
        {
          verse_id: string;
          schema_version?: number;
          tokens?: Json;
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<VerseTajweed>
      >;
      translations: TableDef<
        Translation,
        {
          id: string;
          language_code: string;
          name: string;
          source: string;
          approval_status?: ContentApprovalStatus;
          created_at?: string;
        },
        Partial<Translation>
      >;
      verse_translations: TableDef<
        VerseTranslation,
        {
          verse_id: string;
          translation_id: string;
          text: string;
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          content_version?: number;
          created_at?: string;
          updated_at?: string;
        },
        Partial<VerseTranslation>
      >;
      content_manifest: TableDef<
        ContentManifest,
        {
          id: string;
          juz_number: number;
          content_version: number;
          corpus_hash: string;
          arabic_source: string;
          notes?: string | null;
          created_at?: string;
        },
        Partial<ContentManifest>
      >;
      lesson_overrides: TableDef<
        LessonOverride,
        {
          id?: string;
          surah_number: number;
          age_group: string;
          start_ayah: number;
          end_ayah: number;
          lesson_index: number;
        },
        Partial<LessonOverride>
      >;
      learner_learning_state: TableDef<
        LearnerLearningState,
        {
          learner_id: string;
          current_surah_number: number;
          current_ayah_number: number;
          current_lesson_key: string;
          age_group_snapshot: string;
          updated_at?: string;
        },
        Partial<LearnerLearningState>
      >;
      verse_progress: TableDef<
        VerseProgress,
        {
          learner_id: string;
          verse_id: string;
          status?: VerseLearningStatus;
          learned_at?: string | null;
          revision_status?: RevisionStatus;
          memory_score?: number | null;
          last_practiced_at?: string | null;
          practice_count?: number;
          created_at?: string;
          updated_at?: string;
        },
        Partial<VerseProgress>
      >;
      surah_progress: TableDef<
        SurahProgress,
        {
          learner_id: string;
          surah_number: number;
          verses_learned?: number;
          verses_total: number;
          status?: SurahLearningStatus;
          completed_at?: string | null;
          updated_at?: string;
        },
        Partial<SurahProgress>
      >;
      lesson_completions: TableDef<
        LessonCompletion,
        {
          id?: string;
          learner_id: string;
          lesson_key: string;
          surah_number: number;
          start_ayah: number;
          end_ayah: number;
          age_group: string;
          completed_at?: string;
        },
        Partial<LessonCompletion>
      >;
      learning_events: TableDef<
        LearningEvent,
        {
          id?: string;
          learner_id: string;
          verse_id?: string | null;
          lesson_key?: string | null;
          event_type: LearningEventType;
          payload?: Json;
          created_at?: string;
        },
        Partial<LearningEvent>
      >;
      verse_explanations: TableDef<
        VerseExplanation,
        {
          verse_id: string;
          language_code: string;
          text: string;
          approval_status?: ContentApprovalStatus;
          approved_at?: string | null;
          content_version?: number;
          created_at?: string;
          updated_at?: string;
        },
        Partial<VerseExplanation>
      >;
      learner_reader_preferences: TableDef<
        LearnerReaderPreferences,
        {
          learner_id: string;
          show_translation?: boolean;
          repeat_count?: AudioRepeatCount;
          preferred_reciter_key?: string;
          preferred_translation_id?: string | null;
          font_scale?: ReaderFontScale | null;
          future_settings?: Json;
          updated_at?: string;
        },
        Partial<LearnerReaderPreferences>
      >;
      learner_reader_state: TableDef<
        LearnerReaderState,
        {
          learner_id: string;
          last_surah_number: number;
          last_ayah_number: number;
          updated_at?: string;
        },
        Partial<LearnerReaderState>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      set_child_pin_hash: {
        Args: { p_child_id: string; p_pin_hash: string };
        Returns: undefined;
      };
      record_pin_failure: {
        Args: {
          p_child_id: string;
          p_max_attempts?: number;
          p_lock_minutes?: number;
        };
        Returns: { failed_attempts: number; locked_until: string | null }[];
      };
      clear_pin_failures: {
        Args: { p_child_id: string };
        Returns: undefined;
      };
      can_manage_learner: {
        Args: { p_learner_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      profile_role: ProfileRole;
      content_approval_status: ContentApprovalStatus;
      verse_learning_status: VerseLearningStatus;
      revision_status: RevisionStatus;
      surah_learning_status: SurahLearningStatus;
      learning_event_type: LearningEventType;
    };
  };
};
