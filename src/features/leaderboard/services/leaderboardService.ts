import type { ActiveLearner, AgeGroupId } from '@/features/auth';
import { computeGameBonusPoints, loadGameProgress } from '@/features/games';
import { loadLearningSnapshot, resolveAgeGroup } from '@/features/learning';
import type { LearningSnapshot } from '@/features/learning';

import {
  JUZ_CHALLENGES,
  type JuzChallengeNumber,
  type LeaderboardViewId,
} from '../constants';
import type {
  LeaderboardBoard,
  LeaderboardEntry,
  LeaderboardModel,
  MotivationMessage,
  PersonalStanding,
} from '../types';
import { ageGroupLabel } from '../types';
import { flagForCountryCode } from './countryFlag';
import { computeCurrentPower, computeEffortBreakdown, latestLearningActivityAt } from './effortPoints';
import {
  computePlacesMoved,
  loadRankSnapshot,
  saveRankSnapshot,
} from './rankDeltaStorage';

type RealLearnerRow = {
  learner: ActiveLearner;
  displayName: string;
  ageGroup: AgeGroupId;
  lifetimePoints: number;
  currentPower: number;
  juzPoints: number;
  juzCurrentPower: number;
  effort: ReturnType<typeof computeEffortBreakdown>;
};

function sortAndRank(
  rows: Array<Omit<LeaderboardEntry, 'rank'>>,
): LeaderboardEntry[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (a.isCurrentUser !== b.isCurrentUser) {
      return a.isCurrentUser ? -1 : 1;
    }
    return a.displayName.localeCompare(b.displayName);
  });

  return sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

function personalStanding(
  entries: LeaderboardEntry[],
  placesMoved: number | null,
): PersonalStanding {
  const you = entries.find((entry) => entry.isCurrentUser);
  if (!you) {
    return {
      rank: entries.length + 1,
      points: 0,
      pointsBehindNext: null,
      placesMoved,
      totalInBoard: entries.length,
    };
  }

  const ahead = entries.find((entry) => entry.rank === you.rank - 1);
  return {
    rank: you.rank,
    points: you.points,
    pointsBehindNext: ahead ? Math.max(0, ahead.points - you.points) : null,
    placesMoved,
    totalInBoard: entries.length,
  };
}

function buildMotivations(
  effort: ReturnType<typeof computeEffortBreakdown>,
  you: PersonalStanding,
): MotivationMessage[] {
  const messages: MotivationMessage[] = [];

  if (effort.streakDays > 0) {
    messages.push({
      id: 'streak',
      text: `🔥 You're on a ${effort.streakDays}-day learning streak!`,
    });
  }

  if (you.pointsBehindNext != null && you.pointsBehindNext > 0) {
    messages.push({
      id: 'gap',
      text: `🚀 You're ${you.pointsBehindNext} points away from the next student.`,
    });
  } else if (you.rank === 1) {
    messages.push({
      id: 'top',
      text: '⭐ You are leading this board — keep the consistency going!',
    });
  }

  if (effort.lessonsCompleted > 0) {
    messages.push({
      id: 'lessons',
      text: `⭐ You completed ${effort.lessonsCompleted} lesson${
        effort.lessonsCompleted === 1 ? '' : 's'
      }. Every lesson lifts your rank.`,
    });
  }

  if (effort.gameBonusPoints > 0) {
    messages.push({
      id: 'games',
      text: '🎮 Islamic games are adding real learning points to your rank.',
    });
  }

  if (you.placesMoved != null && you.placesMoved > 0) {
    messages.push({
      id: 'rose',
      text: `You moved up ${you.placesMoved} place${you.placesMoved === 1 ? '' : 's'}!`,
    });
  } else if (effort.lessonsCompleted < 2) {
    messages.push({
      id: 'nudge',
      text: '📖 Keep going — 2 more lessons to move up!',
    });
  }

  if (messages.length === 0) {
    messages.push({
      id: 'start',
      text: '🌱 Every ayah you learn counts. Start a lesson to climb the board.',
    });
  }

  return messages.slice(0, 4);
}

function resolveCurrentJuz(snapshot: LearningSnapshot): JuzChallengeNumber {
  const surah = snapshot.state.currentSurahNumber;
  if (surah >= 78) {
    return 30;
  }
  if (surah >= 67) {
    return 29;
  }
  return 28;
}

async function loadRealLearnerRow(learner: ActiveLearner): Promise<RealLearnerRow | null> {
  const displayName = learner.display_name.trim();
  if (!displayName) {
    return null;
  }
  try {
    const ageGroup = resolveAgeGroup(learner);
    const snapshot = await loadLearningSnapshot(learner);
    const gameProgress = await loadGameProgress(learner);
    const effort = computeEffortBreakdown(snapshot, {
      gameBonusPoints: computeGameBonusPoints(gameProgress),
    });
    const lastActivityAt = latestLearningActivityAt(snapshot, [
      gameProgress.lastPlayedDate,
      ...gameProgress.completions.map((item) => item.completedAt),
    ]);
    return {
      learner,
      displayName,
      ageGroup,
      lifetimePoints: effort.totalPoints,
      currentPower: computeCurrentPower(effort.totalPoints, lastActivityAt),
      juzPoints: effort.juz30VersePoints,
      juzCurrentPower: computeCurrentPower(effort.juz30VersePoints, lastActivityAt),
      effort,
    };
  } catch {
    return null;
  }
}

function toEntry(
  row: RealLearnerRow,
  currentId: string,
  points: number,
  activeNow: boolean,
): Omit<LeaderboardEntry, 'rank'> {
  const isMe = row.learner.id === currentId;
  return {
    id: row.learner.id,
    displayName: row.displayName,
    countryCode: isMe ? '' : row.learner.country_code,
    flag: isMe ? '' : flagForCountryCode(row.learner.country_code),
    avatarKey: row.learner.avatar_key,
    points,
    lifetimePoints: row.lifetimePoints,
    ageGroup: row.ageGroup,
    isCurrentUser: isMe,
    isActiveNow: activeNow && isMe,
  };
}

function buildBoard(options: {
  view: LeaderboardViewId;
  title: string;
  subtitle: string;
  currentId: string;
  rows: RealLearnerRow[];
  pickPoints: (row: RealLearnerRow) => number;
  include: (row: RealLearnerRow) => boolean;
  effort: ReturnType<typeof computeEffortBreakdown>;
  placesMoved: number | null;
  juzNumber?: JuzChallengeNumber;
  juzStatus?: 'active' | 'upcoming';
  activeNow: boolean;
}): LeaderboardBoard {
  const selected = options.rows.filter(options.include);
  const entries = sortAndRank(
    selected.map((row) =>
      toEntry(row, options.currentId, options.pickPoints(row), options.activeNow),
    ),
  );
  const you = personalStanding(entries, options.placesMoved);

  return {
    view: options.view,
    title: options.title,
    subtitle: options.subtitle,
    entries,
    you,
    motivations: buildMotivations(options.effort, you),
    juzNumber: options.juzNumber,
    juzStatus: options.juzStatus,
  };
}

export async function buildLeaderboardModel(options: {
  activeLearner: ActiveLearner;
  snapshot: LearningSnapshot;
  isGuest: boolean;
  familyLearners: ActiveLearner[];
  selectedJuz?: JuzChallengeNumber;
}): Promise<LeaderboardModel> {
  const { activeLearner, snapshot, isGuest } = options;
  const ageGroup = resolveAgeGroup(activeLearner);
  const gameProgress = await loadGameProgress(activeLearner);
  const effort = computeEffortBreakdown(snapshot, {
    gameBonusPoints: computeGameBonusPoints(gameProgress),
  });
  const lastActivityAt = latestLearningActivityAt(snapshot, [
    gameProgress.lastPlayedDate,
    ...gameProgress.completions.map((item) => item.completedAt),
  ]);
  const currentPower = computeCurrentPower(effort.totalPoints, lastActivityAt);
  const currentJuzNumber = options.selectedJuz ?? resolveCurrentJuz(snapshot);
  const juzMeta =
    JUZ_CHALLENGES.find((item) => item.juzNumber === currentJuzNumber) ?? JUZ_CHALLENGES[0];

  const uniqueById = new Map<string, ActiveLearner>();
  uniqueById.set(activeLearner.id, activeLearner);
  for (const learner of options.familyLearners) {
    uniqueById.set(learner.id, learner);
  }

  const rows: RealLearnerRow[] = [];
  for (const learner of uniqueById.values()) {
    if (learner.id === activeLearner.id) {
      rows.push({
        learner: activeLearner,
        displayName: activeLearner.display_name.trim() || 'You',
        ageGroup,
        lifetimePoints: effort.totalPoints,
        currentPower,
        juzPoints: effort.juz30VersePoints,
        juzCurrentPower: computeCurrentPower(effort.juz30VersePoints, lastActivityAt),
        effort,
      });
      continue;
    }
    const loaded = await loadRealLearnerRow(learner);
    if (loaded) {
      rows.push(loaded);
    }
  }

  const previous = await loadRankSnapshot();
  const activeNow = true;

  const ageBoard = buildBoard({
    view: 'age',
    title: ageGroupLabel(ageGroup),
    subtitle: 'Fair competition with learners in your age group.',
    currentId: activeLearner.id,
    rows,
    pickPoints: (row) => row.lifetimePoints,
    include: (row) => row.learner.id === activeLearner.id || row.ageGroup === ageGroup,
    effort,
    placesMoved: null,
    activeNow,
  });
  ageBoard.you.placesMoved = computePlacesMoved(previous?.ranks.age, ageBoard.you.rank);
  ageBoard.motivations = buildMotivations(effort, ageBoard.you);

  const juzBoard = buildBoard({
    view: 'juz',
    title: juzMeta.label,
    subtitle:
      juzMeta.status === 'active'
        ? 'Compare progress with students on the same Juz challenge.'
        : 'This Juz challenge is opening soon — keep building Juz 30 strength.',
    currentId: activeLearner.id,
    rows,
    pickPoints: (row) => row.juzCurrentPower,
    include: () => true,
    effort,
    placesMoved: null,
    juzNumber: juzMeta.juzNumber,
    juzStatus: juzMeta.status,
    activeNow,
  });
  juzBoard.you.placesMoved = computePlacesMoved(previous?.ranks.juz, juzBoard.you.rank);
  juzBoard.motivations = buildMotivations(effort, juzBoard.you);

  const allBoard = buildBoard({
    view: 'all',
    title: '🌍 All Students',
    subtitle: 'Real Qur’an Quest learners this app can see.',
    currentId: activeLearner.id,
    rows,
    pickPoints: (row) => row.lifetimePoints,
    include: () => true,
    effort,
    placesMoved: null,
    activeNow,
  });
  allBoard.you.placesMoved = computePlacesMoved(previous?.ranks.all, allBoard.you.rank);
  allBoard.motivations = buildMotivations(effort, allBoard.you);

  await saveRankSnapshot({
    age: ageBoard.you.rank,
    juz: juzBoard.you.rank,
    all: allBoard.you.rank,
  });

  const currentName = activeLearner.display_name.trim() || 'You';

  return {
    displayName: currentName,
    countryCode: '',
    flag: '',
    ageGroup,
    ageGroupLabel: ageGroupLabel(ageGroup),
    effort,
    currentPower,
    isGuest,
    currentJuzNumber: juzMeta.juzNumber,
    learningNow: [{ id: activeLearner.id, displayName: currentName }],
    boards: {
      age: ageBoard,
      juz: juzBoard,
      all: allBoard,
    },
  };
}
