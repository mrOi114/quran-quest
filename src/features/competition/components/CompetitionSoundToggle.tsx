import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

import { useMotivationSound } from '../services/voicePreference';

export function CompetitionSoundToggle() {
  const { t } = useI18n();
  const { enabled, toggle } = useMotivationSound();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={enabled ? t('competition.soundOn') : t('competition.soundOff')}
      accessibilityState={{ checked: enabled }}
      onPress={() => {
        void toggle();
      }}
      className="mt-3 min-h-11 self-start items-center justify-center rounded-xl border border-white/40 bg-white/95 px-3"
    >
      <Text className="text-sm font-semibold text-brand-800">
        {enabled ? t('competition.soundOn') : t('competition.soundOff')}
      </Text>
    </Pressable>
  );
}
