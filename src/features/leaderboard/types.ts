import type { AgeGroupId } from '@/features/auth';
import { AGE_GROUPS } from '@/features/auth';

import type { JuzChallengeNumber, LeaderboardViewId } from './constants';
import type { EffortBreakdown } from './services/effortPoints';

export type LeaderboardEntry = {
  id: string;
  rank: number;
  displayName: string;
  countryCode: string;
  flag: string;
  avatarKey: string;
  points: number;
  lifetimePoints: number;
  ageGroup: AgeGroupId;
  isCurrentUser: boolean;
  isActiveNow: boolean;
};

export type PublicLeaderboardRow = {
  id: string;
  kind: 'guest' | 'profile';
  displayName: string;
  ageGroup: AgeGroupId;
  countryCode: string;
  avatarKey: string;
  lifetimePoints: number;
  juzPoints: number;
  currentPower: number;
  juzCurrentPower: number;
  lastActiveAt: string;
};

export type PublicBoardSlice = {
  entries: PublicLeaderboardRow[];
  myRank: number;
  total: number;
};

export type PublicLeaderboardSnapshot = {
  all: PublicBoardSlice;
  age: PublicBoardSlice;
  juz: PublicBoardSlice;
  learningNow: Array<{ id: string; displayName: string }>;
};

export type PersonalStanding = {
  rank: number;
  points: number;
  pointsBehindNext: number | null;
  placesMoved: number | null;
  totalInBoard: number;
};

export type MotivationMessage = {
  id: string;
  text: string;
};

export type LeaderboardBoard = {
  view: LeaderboardViewId;
  title: string;
  subtitle: string;
  entries: LeaderboardEntry[];
  you: PersonalStanding;
  motivations: MotivationMessage[];
  juzNumber?: JuzChallengeNumber;
  juzStatus?: 'active' | 'upcoming';
};

export type LeaderboardModel = {
  displayName: string;
  countryCode: string;
  flag: string;
  ageGroup: AgeGroupId;
  ageGroupLabel: string;
  effort: EffortBreakdown;
  currentPower: number;
  isGuest: boolean;
  currentJuzNumber: JuzChallengeNumber;
  learningNow: Array<{ id: string; displayName: string }>;
  boards: {
    age: LeaderboardBoard;
    juz: LeaderboardBoard;
    all: LeaderboardBoard;
  };
};

export function ageGroupLabel(ageGroup: AgeGroupId): string {
  return AGE_GROUPS.find((item) => item.id === ageGroup)?.label ?? 'All ages';
}
