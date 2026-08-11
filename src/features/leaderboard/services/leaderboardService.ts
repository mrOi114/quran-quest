import type { ActiveLearner, AgeGroupId } from '@/features/auth';
import { computeGameBonusPoints, loadGameProgress } from '@/features/games';
import { resolveAgeGroup } from '@/features/learning';
import type { LearningSnapshot } from '@/features/learning';

import {
  COMMUNITY_PEERS,
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
import { computeEffortBreakdown } from './effortPoints';
import {
  computePlacesMoved,
  loadRankSnapshot,
  saveRankSnapshot,
} from './rankDeltaStorage';

type PeerSeed = {
  id: string;
  displayName: string;
  countryCode: string;
  ageGroup: AgeGroupId;
  points: number;
};

function scalePeerPoints(
  basePoints: number,
  learnerPoints: number,
  index: number,
): number {
  // Keep peers near the learner so rank movement feels achievable.
  const anchor = Math.max(learnerPoints, 120);
  const spread = Math.round(anchor * (0.35 + (index % 7) * 0.08));
  const offset = basePoints % 97;
  return Math.max(40, anchor + spread - offset - index * 18);
}

function buildPeers(learnerPoints: number, view: LeaderboardViewId): PeerSeed[] {
  return COMMUNITY_PEERS.map((peer, index) => {
    const juzFactor = view === 'juz' ? 0.85 + (index % 5) * 0.04 : 1;
    return {
      id: peer.id,
      displayName: peer.displayName,
      countryCode: peer.countryCode,
      ageGroup: peer.ageGroup,
      points: Math.round(scalePeerPoints(peer.basePoints, learnerPoints, index) * juzFactor),
    };
  });
}

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

function buildBoard(options: {
  view: LeaderboardViewId;
  title: string;
  subtitle: string;
  learner: ActiveLearner;
  ageGroup: AgeGroupId;
  points: number;
  effort: ReturnType<typeof computeEffortBreakdown>;
  peers: PeerSeed[];
  filter?: (peer: PeerSeed) => boolean;
  placesMoved: number | null;
  juzNumber?: JuzChallengeNumber;
  juzStatus?: 'active' | 'upcoming';
}): LeaderboardBoard {
  const filteredPeers = options.filter
    ? options.peers.filter(options.filter)
    : options.peers;

  const youRow: Omit<LeaderboardEntry, 'rank'> = {
    id: `you-${options.learner.id}`,
    displayName: options.learner.display_name.trim() || 'You',
    countryCode: options.learner.country_code,
    flag: flagForCountryCode(options.learner.country_code),
    points: options.points,
    ageGroup: options.ageGroup,
    isCurrentUser: true,
  };

  const peerRows: Array<Omit<LeaderboardEntry, 'rank'>> = filteredPeers.map((peer) => ({
    id: peer.id,
    displayName: peer.displayName,
    countryCode: peer.countryCode,
    flag: flagForCountryCode(peer.countryCode),
    points: peer.points,
    ageGroup: peer.ageGroup,
    isCurrentUser: false,
  }));

  const entries = sortAndRank([youRow, ...peerRows]);
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
  selectedJuz?: JuzChallengeNumber;
}): Promise<LeaderboardModel> {
  const { activeLearner, snapshot, isGuest } = options;
  const ageGroup = resolveAgeGroup(activeLearner);
  const gameProgress = await loadGameProgress(activeLearner);
  const effort = computeEffortBreakdown(snapshot, {
    gameBonusPoints: computeGameBonusPoints(gameProgress),
  });
  const currentJuzNumber = options.selectedJuz ?? resolveCurrentJuz(snapshot);
  const juzMeta =
    JUZ_CHALLENGES.find((item) => item.juzNumber === currentJuzNumber) ?? JUZ_CHALLENGES[0];

  const allPoints = effort.totalPoints;
  const juzPoints =
    juzMeta.status === 'active' ? Math.max(effort.juz30VersePoints, effort.totalPoints) : effort.totalPoints;

  const agePeers = buildPeers(allPoints, 'age');
  const juzPeers = buildPeers(juzPoints, 'juz');
  const allPeers = buildPeers(allPoints, 'all');

  const previous = await loadRankSnapshot();

  const ageBoard = buildBoard({
    view: 'age',
    title: ageGroupLabel(ageGroup),
    subtitle: 'Fair competition with learners in your age group.',
    learner: activeLearner,
    ageGroup,
    points: allPoints,
    effort,
    peers: agePeers,
    filter: (peer) => peer.ageGroup === ageGroup,
    placesMoved: null,
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
    learner: activeLearner,
    ageGroup,
    points: juzPoints,
    effort,
    peers: juzPeers,
    placesMoved: null,
    juzNumber: juzMeta.juzNumber,
    juzStatus: juzMeta.status,
  });
  juzBoard.you.placesMoved = computePlacesMoved(previous?.ranks.juz, juzBoard.you.rank);
  juzBoard.motivations = buildMotivations(effort, juzBoard.you);

  const allBoard = buildBoard({
    view: 'all',
    title: '🌍 All Students',
    subtitle: 'The wider QuranFamily learning community.',
    learner: activeLearner,
    ageGroup,
    points: allPoints,
    effort,
    peers: allPeers,
    placesMoved: null,
  });
  allBoard.you.placesMoved = computePlacesMoved(previous?.ranks.all, allBoard.you.rank);
  allBoard.motivations = buildMotivations(effort, allBoard.you);

  await saveRankSnapshot({
    age: ageBoard.you.rank,
    juz: juzBoard.you.rank,
    all: allBoard.you.rank,
  });

  return {
    displayName: activeLearner.display_name.trim() || 'Friend',
    countryCode: activeLearner.country_code,
    flag: flagForCountryCode(activeLearner.country_code),
    ageGroup,
    ageGroupLabel: ageGroupLabel(ageGroup),
    effort,
    isGuest,
    currentJuzNumber: juzMeta.juzNumber,
    boards: {
      age: ageBoard,
      juz: juzBoard,
      all: allBoard,
    },
  };
}
