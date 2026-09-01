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
  family_code: string | null;
  chat_enabled: boolean;
  calls_enabled: boolean;
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

export type AudioRepeatCount = '1' | '2' | '3' | 'loop';
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

export type FamilyMessageKind = 'text' | 'encouragement' | 'practice_update' | 'dua';
export type FamilyCallKind = 'p2p' | 'group';
export type FamilyCallStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';

export type FamilyMessage = {
  id: string;
  family_id: string;
  sender_id: string;
  kind: FamilyMessageKind;
  body: string;
  created_at: string;
};

export type FamilyCall = {
  id: string;
  family_id: string;
  kind: FamilyCallKind;
  created_by: string;
  callee_id: string;
  status: FamilyCallStatus;
  created_at: string;
  answered_at: string | null;
  ended_at: string | null;
};

export type FamilyCallParticipant = {
  call_id: string;
  profile_id: string;
  status: string;
  muted: boolean;
  joined_at: string | null;
  left_at: string | null;
};

export type FamilyCallSignal = {
  id: string;
  call_id: string;
  sender_id: string;
  payload: Json;
  created_at: string;
};

export type FamilyPushToken = {
  id: string;
  profile_id: string;
  device_key: string;
  expo_push_token: string;
  platform: string;
  updated_at: string;
};

export type CircleKind = 'public' | 'madrasah';
export type SocialGroupKind = 'family' | CircleKind;
export type CircleMemberRole = 'admin' | 'teacher' | 'member' | 'child';
export type TeacherApprovalStatus = 'pending' | 'approved' | 'revoked';

export type AppGroupLimit = {
  key: string;
  member_limit: number;
  updated_at: string;
};

export type TeacherApproval = {
  profile_id: string;
  status: TeacherApprovalStatus;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type Circle = {
  id: string;
  kind: CircleKind;
  name: string;
  creator_id: string;
  join_code: string;
  chat_enabled: boolean;
  audio_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CircleMember = {
  circle_id: string;
  profile_id: string;
  role: CircleMemberRole;
  invited_by: string | null;
  joined_at: string;
  timeout_until: string | null;
  permanently_removed: boolean;
};

export type CircleMessage = {
  id: string;
  circle_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type CircleMessageReaction = {
  message_id: string;
  profile_id: string;
  emoji: string;
  created_at: string;
};

export type CompetitionVisibility = 'public' | 'invite';
export type CompetitionStatus =
  | 'waiting'
  | 'ready_check'
  | 'question'
  | 'reveal'
  | 'complete'
  | 'expired'
  | 'cancelled';
export type CompetitionAgeBand = 'child' | 'teen' | 'adult';

export type CompetitionChallenge = {
  id: string;
  code: string;
  visibility: CompetitionVisibility;
  age_band: CompetitionAgeBand;
  status: CompetitionStatus;
  max_participants: number;
  tier: number;
  question_count: number;
  current_index: number;
  questions_public: Json;
  question_started_at: string | null;
  question_ends_at: string | null;
  reveal_until: string | null;
  last_round_result: Json | null;
  rematch_code: string | null;
  parent_challenge_id: string | null;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
};

export type CompetitionQuestionKey = {
  challenge_id: string;
  answer_key: Json;
};

export type CompetitionParticipant = {
  id: string;
  challenge_id: string;
  participant_key_hash: string;
  profile_id: string | null;
  display_label: string;
  age_band: CompetitionAgeBand;
  is_ready: boolean;
  score: number;
  seat_index: number;
  last_seen_at: string;
  created_at: string;
};

export type CompetitionAnswer = {
  id: string;
  challenge_id: string;
  participant_id: string;
  question_index: number;
  choice_id: string | null;
  submitted_at: string | null;
  is_correct: boolean | null;
};

export type GuestDisplayName = {
  normalized_name: string;
  display_name: string;
  participant_key_hash: string;
  created_at: string;
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
          family_code?: string | null;
          chat_enabled?: boolean;
          calls_enabled?: boolean;
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
      family_messages: TableDef<
        FamilyMessage,
        {
          id?: string;
          family_id: string;
          sender_id: string;
          kind?: FamilyMessageKind;
          body: string;
          created_at?: string;
        },
        Partial<FamilyMessage>
      >;
      family_calls: TableDef<
        FamilyCall,
        {
          id?: string;
          family_id: string;
          kind?: FamilyCallKind;
          created_by: string;
          callee_id: string;
          status?: FamilyCallStatus;
          created_at?: string;
          answered_at?: string | null;
          ended_at?: string | null;
        },
        Partial<FamilyCall>
      >;
      family_call_participants: TableDef<
        FamilyCallParticipant,
        {
          call_id: string;
          profile_id: string;
          status?: string;
          muted?: boolean;
          joined_at?: string | null;
          left_at?: string | null;
        },
        Partial<FamilyCallParticipant>
      >;
      family_call_signals: TableDef<
        FamilyCallSignal,
        {
          id?: string;
          call_id: string;
          sender_id: string;
          payload: Json;
          created_at?: string;
        },
        Partial<FamilyCallSignal>
      >;
      family_push_tokens: TableDef<
        FamilyPushToken,
        {
          id?: string;
          profile_id: string;
          device_key: string;
          expo_push_token: string;
          platform?: string;
          updated_at?: string;
        },
        Partial<FamilyPushToken>
      >;
      app_group_limits: TableDef<
        AppGroupLimit,
        {
          key: string;
          member_limit: number;
          updated_at?: string;
        },
        Partial<AppGroupLimit>
      >;
      teacher_approvals: TableDef<
        TeacherApproval,
        {
          profile_id: string;
          status?: TeacherApprovalStatus;
          requested_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        },
        Partial<TeacherApproval>
      >;
      circles: TableDef<
        Circle,
        {
          id?: string;
          kind: CircleKind;
          name: string;
          creator_id: string;
          join_code: string;
          chat_enabled?: boolean;
          audio_enabled?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Circle>
      >;
      circle_members: TableDef<
        CircleMember,
        {
          circle_id: string;
          profile_id: string;
          role?: CircleMemberRole;
          invited_by?: string | null;
          joined_at?: string;
          timeout_until?: string | null;
          permanently_removed?: boolean;
        },
        Partial<CircleMember>
      >;
      circle_messages: TableDef<
        CircleMessage,
        {
          id?: string;
          circle_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        },
        Partial<CircleMessage>
      >;
      circle_message_reactions: TableDef<
        CircleMessageReaction,
        {
          message_id: string;
          profile_id: string;
          emoji: string;
          created_at?: string;
        },
        Partial<CircleMessageReaction>
      >;
      competition_challenges: TableDef<
        CompetitionChallenge,
        {
          id?: string;
          code: string;
          visibility: CompetitionVisibility;
          age_band: CompetitionAgeBand;
          status?: CompetitionStatus;
          max_participants?: number;
          tier?: number;
          question_count: number;
          current_index?: number;
          questions_public?: Json;
          question_started_at?: string | null;
          question_ends_at?: string | null;
          reveal_until?: string | null;
          last_round_result?: Json | null;
          rematch_code?: string | null;
          parent_challenge_id?: string | null;
          created_at?: string;
          expires_at: string;
          completed_at?: string | null;
        },
        Partial<CompetitionChallenge>
      >;
      competition_question_keys: TableDef<
        CompetitionQuestionKey,
        { challenge_id: string; answer_key: Json },
        Partial<CompetitionQuestionKey>
      >;
      competition_participants: TableDef<
        CompetitionParticipant,
        {
          id?: string;
          challenge_id: string;
          participant_key_hash: string;
          profile_id?: string | null;
          display_label: string;
          age_band: CompetitionAgeBand;
          is_ready?: boolean;
          score?: number;
          seat_index: number;
          last_seen_at?: string;
          created_at?: string;
        },
        Partial<CompetitionParticipant>
      >;
      competition_answers: TableDef<
        CompetitionAnswer,
        {
          id?: string;
          challenge_id: string;
          participant_id: string;
          question_index: number;
          choice_id?: string | null;
          submitted_at?: string | null;
          is_correct?: boolean | null;
        },
        Partial<CompetitionAnswer>
      >;
      guest_display_names: TableDef<
        GuestDisplayName,
        {
          normalized_name: string;
          display_name: string;
          participant_key_hash: string;
          created_at?: string;
        },
        Partial<GuestDisplayName>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      claim_guest_display_name: {
        Args: { p_normalized: string; p_display: string; p_hash: string };
        Returns: Json;
      };
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
      generate_family_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      ensure_parent_family_code: {
        Args: { p_parent_id?: string };
        Returns: string;
      };
      family_id_of: {
        Args: { p_profile_id: string };
        Returns: string;
      };
      is_family_member: {
        Args: { p_profile_id: string; p_family_id: string };
        Returns: boolean;
      };
      same_family: {
        Args: { p_left: string; p_right: string };
        Returns: boolean;
      };
      can_act_as_family_member: {
        Args: { p_member_id: string };
        Returns: boolean;
      };
      child_chat_allowed: {
        Args: { p_profile_id: string };
        Returns: boolean;
      };
      child_calls_allowed: {
        Args: { p_profile_id: string };
        Returns: boolean;
      };
      group_member_limit: {
        Args: Record<string, never>;
        Returns: number;
      };
      contains_contact_info: {
        Args: { p_body: string };
        Returns: boolean;
      };
      ensure_family_group: {
        Args: Record<string, never>;
        Returns: Json;
      };
      is_approved_teacher: {
        Args: { p_profile_id: string };
        Returns: boolean;
      };
      request_teacher_role: {
        Args: Record<string, never>;
        Returns: Json;
      };
      approve_teacher: {
        Args: { p_profile_id: string };
        Returns: Json;
      };
      list_pending_teachers: {
        Args: Record<string, never>;
        Returns: Json;
      };
      create_circle: {
        Args: { p_kind: CircleKind; p_name: string };
        Returns: Json;
      };
      join_circle: {
        Args: { p_join_code: string };
        Returns: Json;
      };
      connect_child_to_circle: {
        Args: { p_circle_id: string; p_child_id: string };
        Returns: Json;
      };
      timeout_circle_member: {
        Args: { p_circle_id: string; p_profile_id: string };
        Returns: Json;
      };
      permanently_remove_circle_member: {
        Args: { p_circle_id: string; p_profile_id: string };
        Returns: Json;
      };
      set_circle_chat_enabled: {
        Args: { p_circle_id: string; p_enabled: boolean };
        Returns: Json;
      };
      set_circle_audio_enabled: {
        Args: { p_circle_id: string; p_enabled: boolean };
        Returns: Json;
      };
      list_circle_directory: {
        Args: { p_circle_id: string };
        Returns: Json;
      };
      get_circle: {
        Args: { p_circle_id: string };
        Returns: Json;
      };
      list_my_circles: {
        Args: Record<string, never>;
        Returns: Json;
      };
      circle_timeout_message: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      profile_role: ProfileRole;
      content_approval_status: ContentApprovalStatus;
      verse_learning_status: VerseLearningStatus;
      revision_status: RevisionStatus;
      surah_learning_status: SurahLearningStatus;
      learning_event_type: LearningEventType;
      family_message_kind: FamilyMessageKind;
      family_call_kind: FamilyCallKind;
      family_call_status: FamilyCallStatus;
      circle_kind: CircleKind;
      circle_member_role: CircleMemberRole;
      teacher_approval_status: TeacherApprovalStatus;
      competition_visibility: CompetitionVisibility;
      competition_status: CompetitionStatus;
      competition_age_band: CompetitionAgeBand;
    };
  };
};
