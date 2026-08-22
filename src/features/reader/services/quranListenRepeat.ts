import type { AudioRepeatCount } from '@/types';

export type ListenEndedAction = 'replay' | 'advance' | 'complete';

export function playsForRepeat(count: AudioRepeatCount): number {
  if (count === 'loop') {
    return Number.POSITIVE_INFINITY;
  }
  if (count === '3') {
    return 3;
  }
  if (count === '2') {
    return 2;
  }
  return 1;
}

export function shouldPreserveRemainingPlays(options: {
  resetRemaining?: boolean;
  sameCursor: boolean;
  remainingPlays: number;
}): boolean {
  return options.resetRemaining === false && options.sameCursor && options.remainingPlays > 0;
}

export function resolveListenEndedAction(
  remainingAfterDecrement: number,
  advance: boolean,
): ListenEndedAction {
  if (remainingAfterDecrement > 0) {
    return 'replay';
  }
  if (advance) {
    return 'advance';
  }
  return 'complete';
}
