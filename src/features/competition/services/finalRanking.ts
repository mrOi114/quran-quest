import type { CompetitionPlayerView } from '../types';

export type CelebrationRow = {
  participant_id: string;
  display_label: string;
  score: number;
  percent: number;
  medal: string;
  is_you: boolean;
};

export type CelebrationSummary = {
  isDraw: boolean;
  winnerName: string | null;
  rows: CelebrationRow[];
};

const MEDALS = ['🥇', '🥈', '🥉'];

export function buildCelebrationSummary(
  players: CompetitionPlayerView[],
  questionCount: number,
): CelebrationSummary {
  const total = Math.max(1, questionCount);
  const ranked = [...players]
    .filter((player) => player.display_label.trim().length > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.seat_index - right.seat_index;
    });

  const uniqueScores: number[] = [];
  for (const player of ranked) {
    if (!uniqueScores.includes(player.score)) {
      uniqueScores.push(player.score);
    }
  }

  const rows: CelebrationRow[] = ranked.map((player) => {
    const place = uniqueScores.indexOf(player.score) + 1;
    return {
      participant_id: player.participant_id,
      display_label: player.display_label,
      score: player.score,
      percent: Math.round((player.score / total) * 100),
      medal: MEDALS[place - 1] ?? `${place}.`,
      is_you: player.is_you,
    };
  });

  const topScore = ranked[0]?.score;
  const tiedAtTop = ranked.filter((player) => player.score === topScore);
  const isDraw = tiedAtTop.length > 1;
  const winnerName = !isDraw && ranked[0] ? ranked[0].display_label : null;

  return { isDraw, winnerName, rows };
}
