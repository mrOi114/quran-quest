export const SAFE_CIRCLE_EMOJIS = [
  '😀',
  '🙂',
  '😊',
  '❤️',
  '💚',
  '👍',
  '🤲',
  '🌟',
  '✨',
  '🎉',
  '👏',
  '🥰',
  '😇',
  '💪',
  '📖',
  '🕌',
] as const;

export type SafeCircleEmoji = (typeof SAFE_CIRCLE_EMOJIS)[number];

export const CIRCLE_MESSAGE_MAX_LENGTH = 2000;
