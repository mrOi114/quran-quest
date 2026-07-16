import { Text, View } from 'react-native';

import type { AgeGroupId } from '@/features/auth';

import {
  ARABIC_FONT_FAMILY,
  ARABIC_FONT_SIZE,
  FONT_SCALE_MULTIPLIER,
} from '../constants';
import { toEasternNumerals } from '../services/numerals';
import type { ReaderFontScale } from '../types';

type ArabicVerseTextProps = {
  textUthmani: string;
  ayahNumber: number;
  ageGroup: AgeGroupId;
  isLearned?: boolean;
  /** Display-only size override; never alters Arabic content. */
  fontScale?: ReaderFontScale | null;
};

export function ArabicVerseText({
  textUthmani,
  ayahNumber,
  ageGroup,
  isLearned = false,
  fontScale = null,
}: ArabicVerseTextProps) {
  const baseSize = ARABIC_FONT_SIZE[ageGroup];
  const multiplier = fontScale ? FONT_SCALE_MULTIPLIER[fontScale] : 1;
  const fontSize = Math.round(baseSize * multiplier);

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
