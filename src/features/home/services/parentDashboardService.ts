import type { ActiveLearner, FamilyMember } from '@/features/auth';
import { countCompletedSurahs, loadLearningSnapshot } from '@/features/learning';
import { computeGameBonusPoints, loadGameProgress } from '@/features/games';
import { computeEffortBreakdown } from '@/features/leaderboard/services/effortPoints';
import { genderLabel } from '@/features/auth/utils/childGender';

export type ChildProgressOverview = {
  childId: string;
  displayName: string;
  age: number | null;
  genderLabel: string | null;
  xpPoints: number;
  streakDays: number;
  lessonsCompleted: number;
  surahsCompleted: number;
  versesLearned: number;
  gameCompletions: number;
  achievements: number;
  currentLessonLabel: string;
};

function toLearner(child: FamilyMember): ActiveLearner {
  return child;
}

export async function buildChildProgressOverview(
  child: FamilyMember,
): Promise<ChildProgressOverview> {
  const learner = toLearner(child);
  const snapshot = await loadLearningSnapshot(learner);
  const gameProgress = await loadGameProgress(learner);
  const effort = computeEffortBreakdown(snapshot, {
    gameBonusPoints: computeGameBonusPoints(gameProgress),
  });

  return {
    childId: child.id,
    displayName: child.display_name,
    age: child.age,
    genderLabel: genderLabel(child.avatar_key),
    xpPoints: effort.totalPoints,
    streakDays: effort.streakDays,
    lessonsCompleted: effort.lessonsCompleted,
    surahsCompleted: countCompletedSurahs(snapshot),
    versesLearned: effort.versesLearned,
    gameCompletions: gameProgress.completions.length,
    achievements: gameProgress.achievements.length,
    currentLessonLabel: snapshot.state.currentLessonKey
      ? snapshot.state.currentLessonKey.replace(/_/g, ' ')
      : 'Not started',
  };
}

export async function buildParentChildrenOverview(
  children: FamilyMember[],
): Promise<ChildProgressOverview[]> {
  const rows: ChildProgressOverview[] = [];
  for (const child of children) {
    rows.push(await buildChildProgressOverview(child));
  }
  return rows;
}
