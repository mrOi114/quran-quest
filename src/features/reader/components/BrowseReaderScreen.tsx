import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';
import type { AudioRepeatCount } from '@/types';

import { useBrowseReader } from '../hooks/useBrowseReader';
import { ReaderChrome } from './ReaderChrome';
import { ReaderVerseFocus } from './ReaderVerseFocus';
import { SurahPickerSheet } from './SurahPickerSheet';

type BrowseReaderScreenProps = {
  surah?: number;
  ayah?: number;
};

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export function BrowseReaderScreen({ surah, ayah }: BrowseReaderScreenProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const {
    surahs,
    surah: currentSurah,
    verses,
    activeAyahNumber,
    preferences,
    isLoading,
    error,
    setActiveAyahNumber,
    selectSurah,
    setShowTranslation,
    setRepeatCount,
    ageGroup,
  } = useBrowseReader({ surahParam: surah, ayahParam: ayah });

  const activeVerse =
    verses.find((verse) => verse.ayahNumber === activeAyahNumber) ?? verses[0];

  if (isLoading && !currentSurah) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">{t('reader.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (error && !currentSurah) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-2xl font-semibold text-brand-800">{t('reader.title')}</Text>
        <Text className="mb-6 text-base text-brand-600">{error}</Text>
        <PrimaryButton
          label={t('common.backToHome')}
          onPress={() => router.replace('/(app)/home')}
        />
      </SafeAreaView>
    );
  }

  if (!currentSurah || !preferences || !ageGroup || !activeVerse) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-6 text-base text-brand-600">
          {t('reader.unlockMore')}
        </Text>
        <PrimaryButton
          label={t('home.continueLearning')}
          onPress={() => router.replace('/(app)/lesson')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ReaderChrome
          titleArabic={currentSurah.nameArabic}
          titleLatin={currentSurah.nameLatin}
          subtitle={t('reader.ayahReadJuz', { ayah: activeVerse.ayahNumber })}
          onBack={() => router.replace('/(app)/home')}
          onOpenSurahPicker={() => setPickerOpen((value) => !value)}
          footer={
            <Text className="mt-4 text-center text-xs text-brand-100">
              {t('lesson.arabicNote')}
            </Text>
          }
        >
          <SurahPickerSheet
            surahs={surahs}
            selectedSurahNumber={currentSurah.number}
            visible={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(surahNumber) => {
              void selectSurah(surahNumber);
            }}
          />

          {error ? (
            <Text className="mb-3 text-center text-sm text-red-100">{error}</Text>
          ) : null}

          <ReaderVerseFocus
            key={activeVerse.id}
            verse={activeVerse}
            ageGroup={ageGroup}
            mode="browse"
            showTranslation={preferences.showTranslation}
            repeatCount={preferences.repeatCount}
            fontScale={preferences.fontScale}
            onToggleTranslation={() => {
              void setShowTranslation(!preferences.showTranslation);
            }}
            onCycleRepeat={() => {
              void setRepeatCount(nextRepeat(preferences.repeatCount));
            }}
          />

          {verses.length > 1 ? (
            <View className="mt-4 flex-row flex-wrap justify-center gap-2">
              {verses.map((verse) => {
                const selected = verse.ayahNumber === activeAyahNumber;
                return (
                  <Pressable
                    key={verse.id}
                    accessibilityRole="button"
                    accessibilityLabel={t('lesson.goToAyah', { ayah: verse.ayahNumber })}
                    onPress={() => setActiveAyahNumber(verse.ayahNumber)}
                    className={`min-h-11 min-w-11 items-center justify-center rounded-xl px-3 ${
                      selected
                        ? 'bg-white'
                        : verse.isLearned
                          ? 'bg-brand-400'
                          : 'bg-brand-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-brand-700' : 'text-white'
                      }`}
                    >
                      {verse.ayahNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View className="mt-6 rounded-2xl bg-brand-50 px-4 py-4">
            <PrimaryButton
              label={t('reader.practiceInLesson')}
              onPress={() => router.push('/(app)/lesson')}
            />
          </View>
        </ReaderChrome>
      </ScrollView>
    </SafeAreaView>
  );
}
