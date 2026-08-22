import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';
import type { AudioRepeatCount } from '@/types';

import { ARABIC_FONT_FAMILY, ARABIC_FONT_SIZE } from '../constants';
import { useFullQuranReader } from '../hooks/useFullQuranReader';
import { MushafBrowserSheet } from './MushafBrowserSheet';
import { ReaderChrome } from './ReaderChrome';
import { ReaderVerseFocus } from './ReaderVerseFocus';

type FullQuranReaderScreenProps = {
  surah?: number;
  ayah?: number;
  listen?: boolean;
  meaningAudio?: boolean;
};

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '2';
  if (current === '2') return '3';
  if (current === '3') return '1';
  return '1';
}

function nextListenRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '2';
  if (current === '2') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export function FullQuranReaderScreen({
  surah,
  ayah,
  listen = false,
  meaningAudio = false,
}: FullQuranReaderScreenProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const {
    filteredSurahs,
    searchQuery,
    setSearchQuery,
    juzNumber,
    juzOptions,
    surah: currentSurah,
    verses,
    activeAyahNumber,
    preferences,
    listenMode,
    audioEnabled,
    autoPlayPending,
    isLoading,
    error,
    setActiveAyahNumber,
    selectSurah,
    selectJuz,
    goToPreviousAyah,
    goToNextAyah,
    canGoPrevious,
    canGoNext,
    setListenMode,
    setAudioEnabled,
    setShowTranslation,
    setRepeatCount,
    listenRepeatCount,
    setListenRepeatCount,
    handleVersePlaybackComplete,
    quranCompleted,
    ageGroup,
  } = useFullQuranReader({
    surahParam: surah,
    ayahParam: ayah,
    listenParam: listen,
    meaningParam: meaningAudio,
  });

  const activeVerse =
    verses.find((verse) => verse.ayahNumber === activeAyahNumber) ?? verses[0];

  if (isLoading && !currentSurah) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">{t('reader.quranLoading')}</Text>
      </SafeAreaView>
    );
  }

  if (error && !currentSurah) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-2xl font-semibold text-brand-800">{t('reader.quranTitle')}</Text>
        <Text className="mb-6 text-base text-brand-600">{error}</Text>
        <PrimaryButton label={t('common.backToHome')} onPress={() => router.replace('/(app)/home')} />
      </SafeAreaView>
    );
  }

  if (!currentSurah || !preferences || !ageGroup || !activeVerse) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-6 text-base text-brand-600">
          {t('reader.signInToOpen')}
        </Text>
        <PrimaryButton label={t('common.backToHome')} onPress={() => router.replace('/(app)/home')} />
      </SafeAreaView>
    );
  }

  const arabicSize = ARABIC_FONT_SIZE[ageGroup];

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
          subtitle={t('reader.surahJuzAyah', {
            surah: currentSurah.number,
            juz: juzNumber,
            ayah: activeVerse.ayahNumber,
          })}
          onBack={() => router.replace('/(app)/home')}
          onOpenSurahPicker={() => setPickerOpen((value) => !value)}
          footer={
            <Text className="mt-4 text-center text-xs text-brand-100">
              {t('reader.fullNote')}
            </Text>
          }
        >
          <View className="mb-4 flex-row flex-wrap justify-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('reader.readOnly')}
              onPress={() => {
                void setListenMode('read');
              }}
              className={`min-h-11 rounded-xl px-4 py-3 ${
                listenMode === 'read' ? 'bg-white' : 'bg-brand-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  listenMode === 'read' ? 'text-brand-700' : 'text-white'
                }`}
              >
                {t('reader.read')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('reader.listenAuto')}
              onPress={() => {
                void setListenMode('listen');
              }}
              className={`min-h-11 rounded-xl px-4 py-3 ${
                listenMode === 'listen' ? 'bg-white' : 'bg-brand-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  listenMode === 'listen' ? 'text-brand-700' : 'text-white'
                }`}
              >
                {t('reader.listen')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('reader.meaningListenAuto')}
              onPress={() => {
                void setListenMode('meaning');
              }}
              className={`min-h-11 rounded-xl px-4 py-3 ${
                listenMode === 'meaning' ? 'bg-white' : 'bg-brand-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  listenMode === 'meaning' ? 'text-brand-700' : 'text-white'
                }`}
              >
                {t('reader.meaningListen')}
              </Text>
            </Pressable>
          </View>

          <MushafBrowserSheet
            visible={pickerOpen}
            juzNumber={juzNumber}
            juzOptions={juzOptions}
            surahs={filteredSurahs}
            selectedSurahNumber={currentSurah.number}
            searchQuery={searchQuery}
            onChangeSearch={setSearchQuery}
            onSelectJuz={(nextJuz) => {
              setSearchQuery('');
              void selectJuz(nextJuz);
            }}
            onSelectSurah={(surahNumber) => {
              void selectSurah(surahNumber);
            }}
            onClose={() => setPickerOpen(false)}
          />

          {!pickerOpen ? (
            <Text className="mb-3 text-center text-xs text-brand-100">
              {t('reader.browseHint')}
            </Text>
          ) : null}

          {error ? (
            <Text className="mb-3 text-center text-sm text-red-100">{error}</Text>
          ) : null}

          {quranCompleted ? (
            <View className="mb-4 rounded-2xl bg-white px-4 py-4">
              <Text className="text-center text-lg font-bold text-brand-800">
                {t('reader.quranAudioComplete')}
              </Text>
              <Text className="mt-2 text-center text-sm text-brand-600">
                {t('reader.quranAudioCompleteBody')}
              </Text>
            </View>
          ) : null}

          <ReaderVerseFocus
            key={activeVerse.id}
            verse={activeVerse}
            ageGroup={ageGroup}
            mode="browse"
            showTranslation={preferences.showTranslation}
            repeatCount={
              listenMode === 'listen' ? listenRepeatCount : preferences.repeatCount
            }
            fontScale={preferences.fontScale}
            autoPlay={
              autoPlayPending && (listenMode === 'listen' || listenMode === 'meaning')
            }
            continuous={listenMode === 'listen' ? audioEnabled : undefined}
            audioEnabled={audioEnabled}
            audioKind={listenMode === 'meaning' ? 'meaning' : 'quran'}
            onToggleAudioEnabled={() => setAudioEnabled(!audioEnabled)}
            onPrevious={() =>
              goToPreviousAyah({
                autoPlay:
                  (listenMode === 'listen' || listenMode === 'meaning') && audioEnabled,
              })
            }
            onNext={() =>
              goToNextAyah({
                autoPlay:
                  (listenMode === 'listen' || listenMode === 'meaning') && audioEnabled,
              })
            }
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPlaybackComplete={handleVersePlaybackComplete}
            onToggleTranslation={() => {
              void setShowTranslation(!preferences.showTranslation);
            }}
            onCycleRepeat={() => {
              if (listenMode === 'listen') {
                setListenRepeatCount(nextListenRepeat(listenRepeatCount));
                return;
              }
              void setRepeatCount(nextRepeat(preferences.repeatCount));
            }}
          />

          <View className="mt-5 rounded-2xl bg-white/10 px-3 py-4">
            <Text className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-brand-100">
              {t('reader.fullSurahTap')}
            </Text>
            {verses.map((verse) => {
              const selected = verse.ayahNumber === activeAyahNumber;
              return (
                <Pressable
                  key={verse.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('common.ayah')} ${verse.ayahNumber}`}
                  onPress={() =>
                    setActiveAyahNumber(verse.ayahNumber, {
                      autoPlay:
                        (listenMode === 'listen' || listenMode === 'meaning') &&
                        audioEnabled,
                    })
                  }
                  className={`mb-2 rounded-2xl px-3 py-3 ${
                    selected ? 'bg-white' : 'bg-brand-700/60'
                  }`}
                >
                  <Text
                    className={`mb-2 text-xs font-semibold ${
                      selected ? 'text-brand-500' : 'text-brand-100'
                    }`}
                  >
                    {verse.ayahNumber}
                    {verse.isLearned ? ` · ${t('common.learned')}` : ''}
                  </Text>
                  <Text
                    className={selected ? 'text-brand-800' : 'text-white'}
                    style={{
                      writingDirection: 'rtl',
                      textAlign: 'right',
                      fontFamily: ARABIC_FONT_FAMILY,
                      fontSize: Math.round(arabicSize * 0.92),
                      lineHeight: Math.round(arabicSize * 1.7),
                    }}
                  >
                    {verse.textUthmani}
                  </Text>
                  {preferences.showTranslation && verse.meaning?.text ? (
                    <Text
                      className={`mt-2 text-sm leading-5 ${
                        selected ? 'text-brand-600' : 'text-brand-100'
                      }`}
                    >
                      {verse.meaning.text}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6 rounded-2xl bg-brand-50 px-4 py-4">
            <Text className="mb-3 text-center text-sm text-brand-600">
              {t('reader.wantLesson')}
            </Text>
            <PrimaryButton
              label={t('reader.openLesson')}
              onPress={() => router.push('/(app)/lesson')}
            />
          </View>
        </ReaderChrome>
      </ScrollView>
      <View className="flex-row gap-3 border-t border-brand-700 bg-brand-600 px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reader.previousAyah')}
          disabled={!canGoPrevious}
          onPress={() =>
            goToPreviousAyah({
              autoPlay:
                (listenMode === 'listen' || listenMode === 'meaning') && audioEnabled,
            })
          }
          className={`min-h-12 flex-1 items-center justify-center rounded-2xl ${
            canGoPrevious ? 'bg-white' : 'bg-brand-700 opacity-50'
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              canGoPrevious ? 'text-brand-700' : 'text-brand-100'
            }`}
          >
            {t('reader.previousAyah')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reader.nextAyah')}
          disabled={!canGoNext}
          onPress={() =>
            goToNextAyah({
              autoPlay:
                (listenMode === 'listen' || listenMode === 'meaning') && audioEnabled,
            })
          }
          className={`min-h-12 flex-1 items-center justify-center rounded-2xl ${
            canGoNext ? 'bg-white' : 'bg-brand-700 opacity-50'
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              canGoNext ? 'text-brand-700' : 'text-brand-100'
            }`}
          >
            {t('reader.nextAyah')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
