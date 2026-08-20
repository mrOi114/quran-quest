import type { LearningSnapshot, LessonTestKind } from '../types';

export type AbilityBand = 'beginner' | 'improving' | 'strong' | 'excellent';

export type QuizStyle = 'game' | 'test';

const MEANING_KINDS: LessonTestKind[] = ['meaning', 'identify'];

export function isUnderEight(ageYears: number): boolean {
  return ageYears < 8;
}

export function resolveAbilityBand(snapshot: LearningSnapshot): AbilityBand {
  const scored = snapshot.lessonCompletions
    .map((item) => item.testScorePercent)
    .filter((score): score is number => typeof score === 'number');
  const recent = scored.slice(-5);
  const verseScores = Object.values(snapshot.verseProgress)
    .map((item) => item.memoryScore)
    .filter((score): score is number => typeof score === 'number');
  const practiceHeavy = Object.values(snapshot.verseProgress).filter(
    (item) => item.practiceCount >= 4 && (item.memoryScore == null || item.memoryScore < 70),
  ).length;

  let average: number | null = null;
  if (recent.length > 0) {
    average = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  } else if (verseScores.length > 0) {
    average = verseScores.reduce((sum, score) => sum + score, 0) / verseScores.length;
  }

  const lastTwo = recent.slice(-2);
  const strugglingLately =
    lastTwo.length === 2 && lastTwo.every((score) => score < 70) ? true : practiceHeavy >= 3;

  if (recent.length === 0 && snapshot.lessonCompletions.length === 0) {
    return 'beginner';
  }
  if (strugglingLately || (average != null && average < 65)) {
    return 'beginner';
  }
  if (average != null && average < 78) {
    return 'improving';
  }
  if (average != null && average < 90) {
    return 'strong';
  }
  if (average != null && average >= 90 && snapshot.lessonCompletions.length >= 2) {
    return 'excellent';
  }
  return 'improving';
}

export function capBandByAge(band: AbilityBand, ageYears: number): AbilityBand {
  const rank: AbilityBand[] = ['beginner', 'improving', 'strong', 'excellent'];
  let max: AbilityBand = 'excellent';
  if (isUnderEight(ageYears)) {
    max = 'improving';
  } else if (ageYears <= 10) {
    max = 'strong';
  }
  return rank[Math.min(rank.indexOf(band), rank.indexOf(max))] ?? 'beginner';
}

export function allowsMeaningQuestions(ageYears: number, band: AbilityBand): boolean {
  if (isUnderEight(ageYears)) {
    return false;
  }
  if (ageYears <= 10) {
    return band === 'strong' || band === 'excellent';
  }
  return band !== 'beginner';
}

export function allowedQuestionKinds(
  ageYears: number,
  band: AbilityBand,
  style: QuizStyle,
): LessonTestKind[] {
  const capped = capBandByAge(band, ageYears);
  const easy: LessonTestKind[] = ['listen', 'match', 'next', 'surah'];
  if (style === 'game' || capped === 'beginner' || isUnderEight(ageYears)) {
    return easy;
  }
  if (capped === 'improving') {
    return [...easy, 'missing'];
  }
  const withMemory: LessonTestKind[] = [...easy, 'missing', 'before'];
  if (!allowsMeaningQuestions(ageYears, capped)) {
    return withMemory;
  }
  if (capped === 'strong') {
    return [...withMemory, 'meaning'];
  }
  return [...withMemory, 'meaning', 'identify'];
}
