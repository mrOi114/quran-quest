import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/features/auth';
import type { AudioRepeatCount } from '@/types';

import { ARABIC_FONT_FAMILY, ARABIC_FONT_SIZE } from '../constants';
import { useFullQuranReader } from '../hooks/useFullQuranReader';
import { MushafBrowserSheet } from './MushafBrowserSheet';
import { ReaderChrome } from './ReaderChrome';
import { ReaderVerseFocus } from './ReaderVerseFocus';

type FullQuranReaderScreenProps = {
  surah?: number;
  ayah?: number;
};

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export function FullQuranReaderScreen({ surah, ayah }: FullQuranReaderScreenProps) {
  const router = useRouter();
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
    setListenMode,
    setAudioEnabled,
    setShowTranslation,
    setRepeatCount,
    handleVersePlaybackComplete,
    ageGroup,
  } = useFullQuranReader({ surahParam: surah, ayahParam: ayah });

  const activeVerse =
    verses.find((verse) => verse.ayahNumber === activeAyahNumber) ?? verses[0];

  if (isLoading && !currentSurah) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">Opening the Qur’an…</Text>
      </SafeAreaView>
    );
  }

  if (error && !currentSurah) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-2xl font-semibold text-brand-800">Qur’an Reader</Text>
        <Text className="mb-6 text-base text-brand-600">{error}</Text>
        <PrimaryButton label="Back to Home" onPress={() => router.replace('/(app)/home')} />
      </SafeAreaView>
    );
  }

  if (!currentSurah || !preferences || !ageGroup || !activeVerse) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-50 px-6">
        <Text className="mb-6 text-base text-brand-600">
          Sign in or continue as guest to open the full Qur’an reader.
        </Text>
        <PrimaryButton label="Back to Home" onPress={() => router.replace('/(app)/home')} />
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
          subtitle={`Surah ${currentSurah.number} · Juz ${juzNumber} · Ayah ${activeVerse.ayahNumber}`}
          onBack={() => router.replace('/(app)/home')}
          onOpenSurahPicker={() => setPickerOpen((value) => !value)}
          footer={
            <Text className="mt-4 text-center text-xs text-brand-100">
              Full Qur’an reading & listening — separate from Lesson memorisation.
            </Text>
          }
        >
          <View className="mb-4 flex-row flex-wrap justify-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Read only mode"
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
                Read
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Listen mode with auto advance"
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
                Listen
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
              Tap “Choose Surah / Juz” to browse all 114 Surahs and 30 Juz.
            </Text>
          ) : null}

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
            autoPlay={autoPlayPending && listenMode === 'listen'}
            audioEnabled={audioEnabled}
            onToggleAudioEnabled={() => setAudioEnabled(!audioEnabled)}
            onPrevious={() =>
              goToPreviousAyah({
                autoPlay: listenMode === 'listen' && audioEnabled,
              })
            }
            onNext={() =>
              goToNextAyah({
                autoPlay: listenMode === 'listen' && audioEnabled,
              })
            }
            canGoPrevious={!(currentSurah.number === 1 && activeAyahNumber === 1)}
            canGoNext={activeAyahNumber < currentSurah.ayahCount}
            onPlaybackComplete={handleVersePlaybackComplete}
            onToggleTranslation={() => {
              void setShowTranslation(!preferences.showTranslation);
            }}
            onCycleRepeat={() => {
              void setRepeatCount(nextRepeat(preferences.repeatCount));
            }}
          />

          <View className="mt-5 rounded-2xl bg-white/10 px-3 py-4">
            <Text className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-brand-100">
              Full surah · tap a verse to start
            </Text>
            {verses.map((verse) => {
              const selected = verse.ayahNumber === activeAyahNumber;
              return (
                <Pressable
                  key={verse.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ayah ${verse.ayahNumber}`}
                  onPress={() =>
                    setActiveAyahNumber(verse.ayahNumber, {
                      autoPlay: listenMode === 'listen' && audioEnabled,
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
                    {verse.isLearned ? ' · Learned' : ''}
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
              Want guided memorisation with a 5-verse lesson and test?
            </Text>
            <PrimaryButton
              label="Open Lesson"
              onPress={() => router.push('/(app)/lesson')}
            />
          </View>
        </ReaderChrome>
      </ScrollView>
    </SafeAreaView>
  );
}
