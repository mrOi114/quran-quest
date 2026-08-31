import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

import { speakEnglishQuestion, stopQuestionSpeech } from '../services/speakEnglishQuestion';

export function ListenToQuestionButton({ englishText }: { englishText: string }) {
  const { t } = useI18n();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      void stopQuestionSpeech();
    };
  }, [englishText]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('competition.listenToQuestion')}
      accessibilityState={{ busy: speaking }}
      onPress={() => {
        void speakEnglishQuestion(englishText, {
          onStart: () => setSpeaking(true),
          onDone: () => setSpeaking(false),
        }).catch(() => setSpeaking(false));
      }}
      className="ml-2 min-h-12 min-w-12 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 px-2"
    >
      <Text className="text-xl">🔊</Text>
    </Pressable>
  );
}
