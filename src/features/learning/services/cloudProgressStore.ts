import type { AgeGroupId } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/types';

import type {
  LearnerLearningState,
  LearningSnapshot,
  LessonCompletionRecord,
  SurahProgressRecord,
  VerseProgressRecord,
} from '../types';
import { createEmptySnapshot, createInitialState } from './progressHelpers';

function mapVerseRow(row: {
  verse_id: string;
  status: VerseProgressRecord['status'];
  learned_at: string | null;
  revision_status: VerseProgressRecord['revisionStatus'];
  memory_score: number | null;
  last_practiced_at: string | null;
  practice_count: number;
}): VerseProgressRecord {
  return {
    verseId: row.verse_id,
    status: row.status,
    learnedAt: row.learned_at,
    revisionStatus: row.revision_status,
    memoryScore: row.memory_score,
    lastPracticedAt: row.last_practiced_at,
    practiceCount: row.practice_count,
  };
}

export async function loadCloudLearningSnapshot(
  learnerId: string,
  ageGroup: AgeGroupId,
): Promise<LearningSnapshot> {
  const [stateRes, verseRes, surahRes, lessonRes] = await Promise.all([
    supabase
      .from('learner_learning_state')
      .select('*')
      .eq('learner_id', learnerId)
      .maybeSingle(),
    supabase.from('verse_progress').select('*').eq('learner_id', learnerId),
    supabase.from('surah_progress').select('*').eq('learner_id', learnerId),
    supabase.from('lesson_completions').select('*').eq('learner_id', learnerId),
  ]);

  if (stateRes.error) {
    throw stateRes.error;
  }
  if (verseRes.error) {
    throw verseRes.error;
  }
  if (surahRes.error) {
    throw surahRes.error;
  }
  if (lessonRes.error) {
    throw lessonRes.error;
  }

  const verseProgress: Record<string, VerseProgressRecord> = {};
  for (const row of verseRes.data ?? []) {
    verseProgress[row.verse_id] = mapVerseRow(row);
  }

  const surahProgress: Record<number, SurahProgressRecord> = {};
  for (const row of surahRes.data ?? []) {
    surahProgress[row.surah_number] = {
      surahNumber: row.surah_number,
      versesLearned: row.verses_learned,
      versesTotal: row.verses_total,
      status: row.status,
      completedAt: row.completed_at,
    };
  }

  const lessonCompletions: LessonCompletionRecord[] = (lessonRes.data ?? []).map(
    (row) => ({
      lessonKey: row.lesson_key,
      surahNumber: row.surah_number,
      startAyah: row.start_ayah,
      endAyah: row.end_ayah,
      ageGroup: row.age_group as AgeGroupId,
      completedAt: row.completed_at,
    }),
  );

  const stateRow = stateRes.data;
  const state: LearnerLearningState = stateRow
    ? {
        currentSurahNumber: stateRow.current_surah_number,
        currentAyahNumber: stateRow.current_ayah_number,
        currentLessonKey: stateRow.current_lesson_key,
        ageGroupSnapshot: stateRow.age_group_snapshot as AgeGroupId,
        updatedAt: stateRow.updated_at,
      }
    : createInitialState(ageGroup);

  const hasStarted =
    Boolean(stateRow) ||
    Object.keys(verseProgress).length > 0 ||
    lessonCompletions.length > 0;

  if (!hasStarted) {
    return createEmptySnapshot(ageGroup);
  }

  return {
    state,
    verseProgress,
    surahProgress,
    lessonCompletions,
    hasStarted,
  };
}

export async function saveCloudLearningState(
  learnerId: string,
  state: LearnerLearningState,
): Promise<void> {
  const { error } = await supabase.from('learner_learning_state').upsert(
    {
      learner_id: learnerId,
      current_surah_number: state.currentSurahNumber,
      current_ayah_number: state.currentAyahNumber,
      current_lesson_key: state.currentLessonKey,
      age_group_snapshot: state.ageGroupSnapshot,
      updated_at: state.updatedAt,
    },
    { onConflict: 'learner_id' },
  );
  if (error) {
    throw error;
  }
}

export async function upsertCloudVerseProgress(
  learnerId: string,
  record: VerseProgressRecord,
): Promise<void> {
  const { error } = await supabase.from('verse_progress').upsert(
    {
      learner_id: learnerId,
      verse_id: record.verseId,
      status: record.status,
      learned_at: record.learnedAt,
      revision_status: record.revisionStatus,
      memory_score: record.memoryScore,
      last_practiced_at: record.lastPracticedAt,
      practice_count: record.practiceCount,
    },
    { onConflict: 'learner_id,verse_id' },
  );
  if (error) {
    throw error;
  }
}

export async function upsertCloudLessonCompletion(
  learnerId: string,
  completion: LessonCompletionRecord,
): Promise<void> {
  const { error } = await supabase.from('lesson_completions').upsert(
    {
      learner_id: learnerId,
      lesson_key: completion.lessonKey,
      surah_number: completion.surahNumber,
      start_ayah: completion.startAyah,
      end_ayah: completion.endAyah,
      age_group: completion.ageGroup,
      completed_at: completion.completedAt,
    },
    { onConflict: 'learner_id,lesson_key' },
  );
  if (error) {
    throw error;
  }
}

export async function insertCloudLearningEvent(options: {
  learnerId: string;
  verseId?: string | null;
  lessonKey?: string | null;
  eventType:
    | 'lesson_started'
    | 'lesson_completed'
    | 'verse_marked_learned'
    | 'verse_reviewed'
    | 'recitation_attempt';
  payload?: Json;
}): Promise<void> {
  const { error } = await supabase.from('learning_events').insert({
    learner_id: options.learnerId,
    verse_id: options.verseId ?? null,
    lesson_key: options.lessonKey ?? null,
    event_type: options.eventType,
    payload: options.payload ?? {},
  });
  if (error) {
    throw error;
  }
}

export async function replaceCloudSnapshot(
  learnerId: string,
  snapshot: LearningSnapshot,
): Promise<void> {
  await saveCloudLearningState(learnerId, snapshot.state);

  const verseRows = Object.values(snapshot.verseProgress).map((record) => ({
    learner_id: learnerId,
    verse_id: record.verseId,
    status: record.status,
    learned_at: record.learnedAt,
    revision_status: record.revisionStatus,
    memory_score: record.memoryScore,
    last_practiced_at: record.lastPracticedAt,
    practice_count: record.practiceCount,
  }));

  if (verseRows.length > 0) {
    const { error } = await supabase.from('verse_progress').upsert(verseRows, {
      onConflict: 'learner_id,verse_id',
    });
    if (error) {
      throw error;
    }
  }

  const lessonRows = snapshot.lessonCompletions.map((item) => ({
    learner_id: learnerId,
    lesson_key: item.lessonKey,
    surah_number: item.surahNumber,
    start_ayah: item.startAyah,
    end_ayah: item.endAyah,
    age_group: item.ageGroup,
    completed_at: item.completedAt,
  }));

  if (lessonRows.length > 0) {
    const { error } = await supabase.from('lesson_completions').upsert(lessonRows, {
      onConflict: 'learner_id,lesson_key',
    });
    if (error) {
      throw error;
    }
  }
}
