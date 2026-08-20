import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';

import { getQisasSeries, listQisasStories } from '../content';
import { localizeText } from '../services/localize';
import type { QisasLanguage } from '../types';

export function IslamicStoriesHomeScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const uiLanguage: QisasLanguage = language === 'so' ? 'so' : 'en';
  const series = getQisasSeries();
  const stories = listQisasStories();

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('games.backToGames')}
          onPress={() => router.back()}
          className="min-h-11 justify-center"
        >
          <Text className="text-sm font-semibold text-brand-100">← {t('games.title')}</Text>
        </Pressable>

        <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand-100">
          ☪️ {t('qisas.hubEyebrow')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{t('qisas.hubTitle')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('qisas.hubHelp')}</Text>

        <View className="mt-5 rounded-3xl bg-white px-4 py-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {localizeText(series.title, uiLanguage)}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-brand-800">
            {localizeText(series.subtitle, uiLanguage)}
          </Text>
          <Text className="mt-2 text-sm text-brand-600">{t('qisas.seriesHelp')}</Text>
        </View>

        <Text className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('qisas.chooseStory')}
        </Text>
        <View className="gap-3">
          {stories.map((story) => (
            <Pressable
              key={story.id}
              accessibilityRole="button"
              accessibilityLabel={localizeText(story.title, uiLanguage)}
              onPress={() =>
                router.push({
                  pathname: '/(app)/qisas/[storyId]',
                  params: { storyId: story.id },
                } as never)
              }
              className="rounded-3xl bg-white px-4 py-4 active:opacity-90"
            >
              <Text className="text-lg font-bold text-brand-800">
                {localizeText(story.title, uiLanguage)}
              </Text>
              <Text className="mt-1 text-sm text-brand-600">
                {t('qisas.prophet')}: {localizeText(story.prophetName, uiLanguage)}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-brand-700">
                {localizeText(story.summary, uiLanguage)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('qisas.openSources')}
          onPress={() => router.push('/(app)/qisas/sources' as never)}
          className="mt-6 min-h-12 items-center justify-center rounded-2xl bg-white/10 px-4"
        >
          <Text className="text-sm font-semibold text-white">{t('qisas.openSources')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
