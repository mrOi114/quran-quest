import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

import type { GameDefinition } from '../types';

type GameCategoryTileProps = {
  game: GameDefinition;
  onPress: () => void;
  locked?: boolean;
};

export function GameCategoryTile({
  game,
  onPress,
  locked = false,
}: GameCategoryTileProps) {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        locked
          ? t('games.comingSoonA11y', { title: game.title })
          : t('games.openTitle', { title: game.title })
      }
      disabled={locked}
      onPress={onPress}
      className={`min-h-24 rounded-3xl px-4 py-4 active:opacity-90 ${
        locked ? 'bg-brand-50/80' : 'bg-white'
      }`}
    >
      <Text className="text-2xl">{game.icon}</Text>
      <Text
        className={`mt-2 text-lg font-bold ${locked ? 'text-brand-500' : 'text-brand-800'}`}
      >
        {game.title}
      </Text>
      <Text className={`mt-1 text-sm ${locked ? 'text-brand-400' : 'text-brand-600'}`}>
        {locked ? t('games.comingSoon') : game.subtitle}
      </Text>
    </Pressable>
  );
}
