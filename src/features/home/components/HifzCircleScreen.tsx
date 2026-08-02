import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import { getDefaultReciter } from '@/features/learning';
import { ReaderVerseFocus, useBrowseReader } from '@/features/reader';
import type { AudioRepeatCount } from '@/types';

type CircleTab = 'suba' | 'translation' | 'leaderboard';

const REPEAT_OPTIONS: AudioRepeatCount[] = ['1', '3', 'loop'];

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export default function HifzCircleScreen() {
  const router = useRouter();
  const { activeLearner } = useAuth();
  const [activeTab, setActiveTab] = useState<CircleTab>('suba');
  const {
    surahs,
    surah,
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
  } = useBrowseReader({});

  const activeVerse =
    verses.find((verse) => verse.ayahNumber === activeAyahNumber) ?? verses[0] ?? null;
  const reciter = getDefaultReciter();

  const roomOptions = useMemo(() => {
    if (!surahs.length) {
      return [];
    }

    if (!surah) {
      return surahs.slice(0, 3);
    }

    const currentIndex = surahs.findIndex((item) => item.number === surah.number);
    const prioritized = [
      surahs[currentIndex],
      surahs[currentIndex + 1],
      surahs[currentIndex - 1],
      ...surahs,
    ].filter((item): item is (typeof surahs)[number] => Boolean(item));

    return prioritized
      .filter(
        (item, index, list) =>
          list.findIndex((candidate) => candidate.number === item.number) === index,
      )
      .slice(0, 3);
  }, [surah, surahs]);

  const leaderboard = useMemo(() => {
    const learnerName = activeLearner?.display_name?.trim() || 'You';
    const repeatBonus =
      preferences?.repeatCount === 'loop'
        ? 240
        : preferences?.repeatCount === '3'
          ? 180
          : 120;
    const learnedVerses = verses.filter((verse) => verse.isLearned).length;
    const yourPoints = learnedVerses * 220 + activeAyahNumber * 35 + repeatBonus;
    const yourStreak = Math.max(learnedVerses, 1) + 4;

    return [
      {
        rank: 1,
        name: 'Ahmed Mohamed',
        points: Math.max(yourPoints + 520, 2450),
        streak: 12,
      },
      {
        rank: 2,
        name: 'Mustafe Mustafa',
        points: Math.max(yourPoints + 190, 2100),
        streak: 8,
      },
      {
        rank: 3,
        name: learnerName,
        points: yourPoints,
        streak: yourStreak,
        isCurrentUser: true,
      },
    ];
  }, [activeAyahNumber, activeLearner?.display_name, preferences?.repeatCount, verses]);

  if (isLoading && !surah) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">Opening your circle…</Text>
      </SafeAreaView>
    );
  }

  if (!activeLearner || !surah || !preferences || !ageGroup || !activeVerse) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-600 px-6">
        <View className="rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">
            Circle is getting ready
          </Text>
          <Text className="mt-3 text-base text-brand-600">
            Open the reader first so QuranFamily can prepare your next listening room.
          </Text>
          <View className="mt-6">
            <PrimaryButton
              label="Open Reader"
              onPress={() => router.replace('/(app)/reader')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            QuranFamily Circle
          </Text>
          <Text className="mt-2 text-2xl font-bold text-brand-800">
            {surah.nameLatin} live listening room
          </Text>
          <Text className="mt-2 text-sm leading-5 text-brand-600">
            Focus on ayah {activeVerse.ayahNumber} with guided repetition, translation,
            and a clean memorisation layout.
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-brand-50 px-3 py-2">
              <Text className="text-xs font-semibold text-brand-700">{reciter.name}</Text>
            </View>
            <View className="rounded-full bg-brand-50 px-3 py-2">
              <Text className="text-xs font-semibold text-brand-700">
                Repeat {preferences.repeatCount}
              </Text>
            </View>
            <View className="rounded-full bg-brand-50 px-3 py-2">
              <Text className="text-xs font-semibold text-brand-700">
                {preferences.showTranslation ? 'Meaning visible' : 'Meaning hidden'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4 rounded-2xl bg-white/10 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            Circle rooms
          </Text>
          <View className="mt-3 gap-2">
            {roomOptions.map((room) => {
              const selected = room.number === surah.number;
              return (
                <Pressable
                  key={room.number}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${room.nameLatin} circle`}
                  onPress={() => {
                    void selectSurah(room.number);
                  }}
                  className={`rounded-2xl px-4 py-4 ${
                    selected ? 'bg-white' : 'bg-white/10'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selected ? 'text-brand-700' : 'text-white'
                    }`}
                  >
                    {room.nameLatin}
                  </Text>
                  <Text
                    className={`mt-1 text-sm ${
                      selected ? 'text-brand-600' : 'text-brand-100'
                    }`}
                  >
                    {room.nameArabic} · {room.maxBrowsableAyah} ayahs ready
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? (
          <View className="mb-4 rounded-2xl bg-red-100 px-4 py-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4 rounded-2xl bg-white px-2 py-2">
          <View className="flex-row justify-between gap-2">
            {[
              { key: 'suba', label: 'Suba Loop' },
              { key: 'translation', label: 'Translation' },
              { key: 'leaderboard', label: 'Rankings' },
            ].map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${tab.label}`}
                  onPress={() => setActiveTab(tab.key as CircleTab)}
                  className={`min-h-11 flex-1 items-center justify-center rounded-xl px-3 ${
                    selected ? 'bg-brand-600' : 'bg-brand-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-white' : 'text-brand-700'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {activeTab === 'suba' ? (
          <>
            <View className="mb-4 rounded-2xl bg-white/10 px-4 py-4">
              <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
                Loop settings
              </Text>
              <Text className="mt-2 text-base text-white">
                Ayah {activeVerse.ayahNumber} focused with {preferences.repeatCount}{' '}
                repeat mode.
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                {REPEAT_OPTIONS.map((option) => {
                  const selected = preferences.repeatCount === option;
                  const label =
                    option === '1' ? 'Once' : option === '3' ? '3 Times' : 'Loop';
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityLabel={`Set repeat to ${label}`}
                      onPress={() => {
                        void setRepeatCount(option);
                      }}
                      className={`min-h-11 rounded-xl px-4 py-3 ${
                        selected ? 'bg-white' : 'bg-brand-700'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selected ? 'text-brand-700' : 'text-white'
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
                      accessibilityLabel={`Focus ayah ${verse.ayahNumber}`}
                      onPress={() => setActiveAyahNumber(verse.ayahNumber)}
                      className={`min-h-11 min-w-11 items-center justify-center rounded-xl px-3 ${
                        selected ? 'bg-white' : 'bg-brand-700'
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
          </>
        ) : null}

        {activeTab === 'translation' ? (
          <View className="rounded-2xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Comparative reading
            </Text>
            <Text
              className="mt-4 text-right text-3xl font-bold text-brand-800"
              style={{ writingDirection: 'rtl' }}
            >
              {activeVerse.textUthmani}
            </Text>
            <Text className="mt-4 text-base leading-7 text-brand-700">
              {activeVerse.meaning?.text ??
                'Translation is not available for this ayah yet.'}
            </Text>
            <Text className="mt-2 text-xs text-brand-500">
              {activeVerse.meaning?.sourceLabel ?? 'Approved translation'}
            </Text>
            <Text className="mt-4 text-sm text-brand-600">
              Preferred language: {activeLearner.preferred_language.toUpperCase()}
              {activeVerse.meaning?.isFallback
                ? ' · English is shown until your preferred translation is ready.'
                : ''}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                preferences.showTranslation
                  ? 'Hide translation in player'
                  : 'Show translation in player'
              }
              onPress={() => {
                void setShowTranslation(!preferences.showTranslation);
              }}
              className="mt-4 min-h-11 items-center justify-center rounded-xl bg-brand-50 px-4 py-3"
            >
              <Text className="text-sm font-semibold text-brand-700">
                {preferences.showTranslation
                  ? 'Hide from Suba player'
                  : 'Show in Suba player'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {activeTab === 'leaderboard' ? (
          <View className="rounded-2xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              Global standings
            </Text>
            <View className="mt-4 gap-3">
              {leaderboard.map((entry) => (
                <View
                  key={entry.rank}
                  className={`rounded-2xl px-4 py-4 ${
                    entry.isCurrentUser ? 'bg-brand-50' : 'bg-brand-900/5'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold text-brand-800">
                        #{entry.rank} {entry.name}
                      </Text>
                      <Text className="mt-1 text-sm text-brand-600">
                        {entry.streak} day streak
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-brand-700">
                      {entry.points} XP
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-6 rounded-2xl bg-white px-4 py-4">
          <PrimaryButton
            label="Open full reader"
            onPress={() =>
              router.push({
                pathname: '/(app)/reader',
                params: {
                  surah: String(surah.number),
                  ayah: String(activeVerse.ayahNumber),
                },
              })
            }
          />
          <PrimaryButton
            label="Continue lesson"
            onPress={() => router.push('/(app)/lesson')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
