import type { GameAchievementId, GameId, GameProgressSnapshot } from '../types';

const GAME_ACHIEVEMENT_MAP: Partial<Record<GameId, GameAchievementId>> = {
  wudu: 'wudu_master',
  salah: 'salah_star',
  prophets: 'prophet_explorer',
  character: 'character_hero',
  ramadan: 'ramadan_explorer',
  quran: 'quran_explorer',
};

export function evaluateAchievementsAfterCompletion(
  progressIncludingNew: GameProgressSnapshot,
  completedGameId: GameId,
): GameAchievementId[] {
  const unlocked = new Set(progressIncludingNew.achievements);
  const newly: GameAchievementId[] = [];

  function unlock(id: GameAchievementId) {
    if (!unlocked.has(id)) {
      newly.push(id);
    }
  }

  if (progressIncludingNew.completions.length >= 1) {
    unlock('islam_explorer');
  }

  const mapped = GAME_ACHIEVEMENT_MAP[completedGameId];
  if (mapped) {
    unlock(mapped);
  }

  const categories = new Set(progressIncludingNew.completions.map((c) => c.category));
  if (categories.size >= 3) {
    unlock('knowledge_seeker');
  }

  return newly;
}
