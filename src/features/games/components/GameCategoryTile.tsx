import { Pressable, Text } from 'react-native';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={locked ? `${game.title}, coming soon` : `Open ${game.title}`}
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
        {locked ? 'Coming soon' : game.subtitle}
      </Text>
    </Pressable>
  );
}
