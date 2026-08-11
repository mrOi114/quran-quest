import type { AgeGroupId } from '@/features/auth';

/** Active Juz challenges. Juz 30 is live; others are shown as upcoming challenges. */
export const JUZ_CHALLENGES = [
  { juzNumber: 30, label: 'Juz 30 Challenge', status: 'active' as const },
  { juzNumber: 29, label: 'Juz 29 Challenge', status: 'upcoming' as const },
  { juzNumber: 28, label: 'Juz 28 Challenge', status: 'upcoming' as const },
] as const;

export type JuzChallengeNumber = (typeof JUZ_CHALLENGES)[number]['juzNumber'];

/** Surahs that belong to Juz 30 in this app’s learning content. */
export const JUZ_30_SURAH_RANGE = { start: 78, end: 114 } as const;

export const LEADERBOARD_VIEWS = [
  { id: 'age', label: 'Age Group' },
  { id: 'juz', label: 'Juz Challenge' },
  { id: 'all', label: '🌍 All Students' },
] as const;

export type LeaderboardViewId = (typeof LEADERBOARD_VIEWS)[number]['id'];

/**
 * Community peers for local ranking boards until a server board ships.
 * Scores are baselines; the live board scales them around the learner’s effort points.
 */
export const COMMUNITY_PEERS: ReadonlyArray<{
  id: string;
  displayName: string;
  countryCode: string;
  ageGroup: AgeGroupId;
  basePoints: number;
}> = [
  { id: 'peer-aisha', displayName: 'Aisha', countryCode: 'ZA', ageGroup: 'child_7_10', basePoints: 1250 },
  { id: 'peer-yusuf', displayName: 'Yusuf', countryCode: 'SA', ageGroup: 'child_11_14', basePoints: 1190 },
  { id: 'peer-maryam', displayName: 'Maryam', countryCode: 'GB', ageGroup: 'teen_15_17', basePoints: 1120 },
  { id: 'peer-abdullah', displayName: 'Abdullah', countryCode: 'EG', ageGroup: 'child_7_10', basePoints: 980 },
  { id: 'peer-fatima', displayName: 'Fatima', countryCode: 'TR', ageGroup: 'child_11_14', basePoints: 940 },
  { id: 'peer-ibrahim', displayName: 'Ibrahim', countryCode: 'NG', ageGroup: 'child_3_6', basePoints: 720 },
  { id: 'peer-zainab', displayName: 'Zainab', countryCode: 'PK', ageGroup: 'teen_15_17', basePoints: 1080 },
  { id: 'peer-omar', displayName: 'Omar', countryCode: 'KE', ageGroup: 'child_7_10', basePoints: 860 },
  { id: 'peer-hala', displayName: 'Hala', countryCode: 'AE', ageGroup: 'child_11_14', basePoints: 1010 },
  { id: 'peer-musa', displayName: 'Musa', countryCode: 'SO', ageGroup: 'adult_18_plus', basePoints: 1340 },
  { id: 'peer-sara', displayName: 'Sara', countryCode: 'MY', ageGroup: 'teen_15_17', basePoints: 890 },
  { id: 'peer-ali', displayName: 'Ali', countryCode: 'US', ageGroup: 'child_3_6', basePoints: 610 },
  { id: 'peer-amina', displayName: 'Amina', countryCode: 'ID', ageGroup: 'child_7_10', basePoints: 770 },
  { id: 'peer-hassan', displayName: 'Hassan', countryCode: 'BD', ageGroup: 'adult_18_plus', basePoints: 1210 },
  { id: 'peer-layla', displayName: 'Layla', countryCode: 'FR', ageGroup: 'child_11_14', basePoints: 830 },
  { id: 'peer-noah', displayName: 'Noah', countryCode: 'CA', ageGroup: 'teen_15_17', basePoints: 960 },
  { id: 'peer-ruqayyah', displayName: 'Ruqayyah', countryCode: 'AU', ageGroup: 'child_7_10', basePoints: 700 },
  { id: 'peer-idris', displayName: 'Idris', countryCode: 'DE', ageGroup: 'adult_18_plus', basePoints: 1150 },
];

export const RANK_DELTA_STORAGE_KEY = 'qq.leaderboard.rank_snapshot.v1';
