import { Text, View } from 'react-native';

import type { AgeGroupId } from '@/features/auth';

import { ARABIC_FONT_FAMILY, ARABIC_FONT_SIZE } from '../constants';
import { toEasternNumerals } from '../services/numerals';

type ArabicVerseTextProps = {
  textUthmani: string;
  ayahNumber: number;
  ageGroup: AgeGroupId;
  isLearned?: boolean;
};

export function ArabicVerseText({
  textUthmani,
  ayahNumber,
  ageGroup,
  isLearned = false,
}: ArabicVerseTextProps) {
  const fontSize = ARABIC_FONT_SIZE[ageGroup];

  return (
    <View accessible accessibilityRole="text">
      <Text className="mb-3 text-center text-sm font-medium text-brand-500">
        Ayah {ayahNumber}
        {isLearned ? ' · Learned' : ''}
        {' · '}
        {toEasternNumerals(ayahNumber)}
      </Text>
      <Text
        className="text-center text-brand-800"
        style={{
          writingDirection: 'rtl',
          textAlign: 'center',
          fontFamily: ARABIC_FONT_FAMILY,
          fontSize,
          lineHeight: Math.round(fontSize * 1.85),
        }}
      >
        {textUthmani}
      </Text>
    </View>
  );
}
