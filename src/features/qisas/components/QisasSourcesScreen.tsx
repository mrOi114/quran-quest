import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';

import { ADAM_STORY, getNarrator, listQisasStories } from '../content';
import { isLicensedAudioSlot } from '../services/permission';
import { localizeText } from '../services/localize';
import type { QisasLanguage, QisasNarratorId, QisasStory } from '../types';

function permissionLabel(status: string): string {
  return status;
}

function StorySourceCard({
  story,
  language,
}: {
  story: QisasStory;
  language: QisasLanguage;
}) {
  const { t } = useI18n();
  const slots = [
    { langLabel: t('qisas.english'), slot: story.englishAudio },
    { langLabel: t('qisas.somali'), slot: story.somaliAudio },
  ];

  return (
    <View className="mt-4 rounded-3xl bg-white px-4 py-4">
      <Text className="text-lg font-bold text-brand-800">
        {localizeText(story.title, language)}
      </Text>
      <Text className="mt-1 text-sm text-brand-600">
        {t('qisas.prophet')}: {localizeText(story.prophetName, language)}
      </Text>
      <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
        {t('qisas.contentReview')}
      </Text>
      <Text className="mt-1 text-sm text-brand-700">{story.contentReviewStatus}</Text>
      <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
        {t('qisas.source')}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-brand-700">
        {localizeText(story.sourceNotes, language)}
      </Text>
      <Text className="mt-2 text-sm text-brand-700">
        {t('qisas.quranRefs')}: {story.quranReferences.join(' · ')}
      </Text>
      {story.hadithReferences.length > 0 ? (
        <Text className="mt-1 text-sm text-brand-700">
          {t('qisas.hadithRefs')}: {story.hadithReferences.join(' · ')}
        </Text>
      ) : null}

      {slots.map(({ langLabel, slot }) => {
        const narrator = getNarrator(slot.narratorId as QisasNarratorId);
        const licensed = isLicensedAudioSlot(slot);
        return (
          <View key={slot.narratorId} className="mt-4 rounded-2xl bg-brand-50 px-3 py-3">
            <Text className="text-sm font-semibold text-brand-800">{langLabel}</Text>
            <Text className="mt-2 text-sm text-brand-700">
              {t('qisas.sheikh')}: {narrator.name}
            </Text>
            <Text className="mt-1 text-sm text-brand-700">
              {t('qisas.audioSource')}: {slot.sourceLabel}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-brand-800">
              {t('qisas.permissionStatus')}: {permissionLabel(slot.permissionStatus)}
            </Text>
            <Text className="mt-1 text-sm text-brand-700">
              {t('qisas.license')}: {slot.license}
            </Text>
            <Text className="mt-1 text-sm text-brand-700">
              {t('qisas.attribution')}: {slot.attribution}
            </Text>
            <Text className="mt-1 text-sm text-brand-700">
              {licensed ? t('qisas.audioReady') : t('qisas.audioEmpty')}
            </Text>
            <Text className="mt-2 text-xs leading-5 text-brand-600">
              {narrator.rightsHolderNote}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function QisasSourcesScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const uiLanguage: QisasLanguage = language === 'so' ? 'so' : 'en';
  const stories = listQisasStories();
  const menk = getNarrator('mufti-ismail-menk');
  const somali = getNarrator('sh-cabdulkadir-sh-maxamed');

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
          onPress={() => router.back()}
          className="min-h-11 justify-center"
        >
          <Text className="text-sm font-semibold text-brand-100">← {t('common.back')}</Text>
        </Pressable>

        <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('qisas.sourcesTitle')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{t('qisas.sourcesTitle')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('qisas.sourcesHelp')}</Text>

        <View className="mt-5 rounded-3xl bg-white px-4 py-4">
          <Text className="text-base font-bold text-brand-800">{menk.name}</Text>
          <Text className="mt-1 text-sm text-brand-600">{menk.targetSeries}</Text>
          <Text className="mt-3 text-sm text-brand-700">
            {t('qisas.permissionStatus')}: {menk.permissionStatus}
          </Text>
          <Text className="mt-1 text-sm text-brand-700">
            {t('qisas.license')}: {menk.license}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-brand-700">{menk.rightsHolderNote}</Text>
          <Text className="mt-2 text-xs text-brand-500">{menk.officialWebsite}</Text>
          <Text className="mt-1 text-xs text-brand-500">{menk.contactUrl}</Text>
        </View>

        <View className="mt-3 rounded-3xl bg-white px-4 py-4">
          <Text className="text-base font-bold text-brand-800">{somali.name}</Text>
          <Text className="mt-1 text-sm text-brand-600">{somali.targetSeries}</Text>
          <Text className="mt-3 text-sm text-brand-700">
            {t('qisas.permissionStatus')}: {somali.permissionStatus}
          </Text>
          <Text className="mt-1 text-sm text-brand-700">
            {t('qisas.license')}: {somali.license}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-brand-700">{somali.rightsHolderNote}</Text>
          <Text className="mt-2 text-xs text-brand-500">{somali.catalogUrl}</Text>
        </View>

        {stories.map((story) => (
          <StorySourceCard key={story.id} story={story} language={uiLanguage} />
        ))}

        <Text className="mt-4 text-center text-xs text-brand-100">
          {ADAM_STORY.id} · PERMISSION_REQUIRED
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
