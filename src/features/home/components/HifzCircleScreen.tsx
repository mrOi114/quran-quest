import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import { getDefaultReciter } from '@/features/learning';
import { ReaderVerseFocus, useBrowseReader } from '@/features/reader';
import { useI18n } from '@/i18n';
import type { AudioRepeatCount } from '@/types';

type CircleTab = 'suba' | 'translation' | 'leaderboard';
type CircleHubMode = 'my' | 'find' | 'join' | 'create';

const REPEAT_OPTIONS: AudioRepeatCount[] = ['1', '3', 'loop'];

function nextRepeat(current: AudioRepeatCount): AudioRepeatCount {
  if (current === '1') return '3';
  if (current === '3') return 'loop';
  return '1';
}

export default function HifzCircleScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { activeLearner, profile, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<CircleTab>('suba');
  const [hubMode, setHubMode] = useState<CircleHubMode>('my');
  const [joinTargetSurah, setJoinTargetSurah] = useState<number | null>(null);
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

  const discoverRooms = useMemo(() => surahs.slice(0, 8), [surahs]);
  const canCreateCircle = profile?.role === 'parent' || profile?.role === 'adult';
  const hubOptions: Array<{ key: CircleHubMode; label: string }> = [
    { key: 'my', label: t('circle.myCircle') },
    { key: 'find', label: t('circle.findCircle') },
    { key: 'join', label: t('circle.joinCircle') },
    { key: 'create', label: t('circle.createCircle') },
  ];

  const leaderboard = useMemo(() => {
    const learnerName = activeLearner?.display_name?.trim() || t('common.you');
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
  }, [activeAyahNumber, activeLearner?.display_name, preferences?.repeatCount, t, verses]);

  if (isLoading && !surah) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">{t('circle.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!activeLearner || !surah || !preferences || !ageGroup || !activeVerse) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-brand-600 px-6">
        <View className="rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">
            {t('circle.gettingReady')}
          </Text>
          <Text className="mt-3 text-base text-brand-600">
            {t('circle.openReaderFirst')}
          </Text>
          <View className="mt-6">
            <PrimaryButton
              label={t('circle.openReader')}
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
            {t('circle.section')}
          </Text>
          <Text className="mt-2 text-2xl font-bold text-brand-800">
            {t('circle.liveRoom', { surah: surah.nameLatin })}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-brand-600">
            {t('circle.focusAyah', { ayah: activeVerse.ayahNumber })}
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-brand-50 px-3 py-2">
              <Text className="text-xs font-semibold text-brand-700">{reciter.name}</Text>
            </View>
            <View className="rounded-full bg-brand-50 px-3 py-2">
              <Text className="text-xs font-semibold text-brand-700">
                {t('circle.repeat', { count: preferences.repeatCount })}
              </Text>
            </View>
            <View className="rounded-full bg-brand-50 px-3 py-2">
              <Text className="text-xs font-semibold text-brand-700">
                {preferences.showTranslation ? t('circle.meaningVisible') : t('circle.meaningHidden')}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4 rounded-2xl bg-white px-2 py-2">
          <View className="flex-row flex-wrap gap-2">
            {hubOptions.map((option) => {
              const selected = hubMode === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() => setHubMode(option.key)}
                  className={`min-h-11 flex-1 basis-[45%] items-center justify-center rounded-xl px-3 ${
                    selected ? 'bg-brand-600' : 'bg-brand-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? 'text-white' : 'text-brand-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {hubMode === 'find' ? (
          <View className="mb-4 rounded-3xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('circle.findCircle')}
            </Text>
            <Text className="mt-2 text-base text-brand-600">
              {t('circle.discoverHelp')}
            </Text>
            <View className="mt-4 gap-2">
              {discoverRooms.map((room) => (
                <Pressable
                  key={`find-${room.number}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('circle.findCircle')} ${room.nameLatin}`}
                  onPress={() => {
                    void selectSurah(room.number);
                    setHubMode('my');
                  }}
                  className="rounded-2xl bg-brand-50 px-4 py-4"
                >
                  <Text className="text-base font-semibold text-brand-800">
                    {room.nameLatin}
                  </Text>
                  <Text className="mt-1 text-sm text-brand-600">
                    {t('circle.ayahsReady', { arabic: room.nameArabic, count: room.maxBrowsableAyah })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {hubMode === 'join' ? (
          <View className="mb-4 rounded-3xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('circle.joinCircle')}
            </Text>
            <Text className="mt-2 text-base text-brand-600">
              {t('circle.joinHelp')}
            </Text>
            <View className="mt-4 gap-2">
              {discoverRooms.map((room) => {
                const selected = joinTargetSurah === room.number;
                return (
                  <Pressable
                    key={`join-${room.number}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setJoinTargetSurah(room.number)}
                    className={`rounded-2xl px-4 py-4 ${
                      selected ? 'bg-brand-600' : 'bg-brand-50'
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        selected ? 'text-white' : 'text-brand-800'
                      }`}
                    >
                      {room.nameLatin}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="mt-4">
              <PrimaryButton
                label={t('circle.joinSelected')}
                onPress={() => {
                  if (joinTargetSurah == null) {
                    return;
                  }
                  void selectSurah(joinTargetSurah);
                  setHubMode('my');
                }}
              />
            </View>
          </View>
        ) : null}

        {hubMode === 'create' ? (
          <View className="mb-4 rounded-3xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('circle.createCircle')}
            </Text>
            {isGuest ? (
              <>
                <Text className="mt-2 text-base text-brand-600">
                  {t('circle.createNeedsAccount')}
                </Text>
                <View className="mt-4">
                  <PrimaryButton
                    label={t('common.createFreeAccount')}
                    onPress={() => router.push('/(auth)/register')}
                  />
                </View>
              </>
            ) : canCreateCircle ? (
              <>
                <Text className="mt-2 text-base text-brand-600">
                  {t('circle.hostingRules')}
                </Text>
                <View className="mt-4">
                  <PrimaryButton
                    label={t('circle.openFamily')}
                    onPress={() => router.push('/(app)/family')}
                  />
                  <PrimaryButton
                    label={t('circle.backToMy')}
                    onPress={() => setHubMode('my')}
                    variant="secondary"
                  />
                </View>
              </>
            ) : (
              <>
                <Text className="mt-2 text-base text-brand-600">
                  {t('circle.createAdultOnly')}
                </Text>
                <View className="mt-4">
                  <PrimaryButton label={t('circle.findCircle')} onPress={() => setHubMode('find')} />
                </View>
              </>
            )}
          </View>
        ) : null}

        {hubMode === 'my' ? (
          <>
        <View className="mb-4 rounded-2xl bg-white/10 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            {t('circle.rooms')}
          </Text>
          <View className="mt-3 gap-2">
            {roomOptions.map((room) => {
              const selected = room.number === surah.number;
              return (
                <Pressable
                  key={room.number}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('circle.myCircle')} ${room.nameLatin}`}
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
                    {t('circle.ayahsReady', { arabic: room.nameArabic, count: room.maxBrowsableAyah })}
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
              { key: 'suba', label: t('circle.subaLoop') },
              { key: 'translation', label: t('circle.translation') },
              { key: 'leaderboard', label: t('circle.rankings') },
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
                {t('circle.loopSettings')}
              </Text>
              <Text className="mt-2 text-base text-white">
                {t('circle.ayahFocused', {
                  ayah: activeVerse.ayahNumber,
                  repeat: preferences.repeatCount,
                })}
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                {REPEAT_OPTIONS.map((option) => {
                  const selected = preferences.repeatCount === option;
                  const label =
                    option === '1'
                      ? t('circle.once')
                      : option === '3'
                        ? t('circle.threeTimes')
                        : t('circle.loop');
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityLabel={label}
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
                      accessibilityLabel={`${t('common.ayah')} ${verse.ayahNumber}`}
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
              {t('circle.comparative')}
            </Text>
            <Text
              className="mt-4 text-right text-3xl font-bold text-brand-800"
              style={{ writingDirection: 'rtl' }}
            >
              {activeVerse.textUthmani}
            </Text>
            <Text className="mt-4 text-base leading-7 text-brand-700">
              {activeVerse.meaning?.text ??
                t('circle.translationMissing')}
            </Text>
            <Text className="mt-2 text-xs text-brand-500">
              {activeVerse.meaning?.sourceLabel ?? t('home.approvedTranslation')}
            </Text>
            <Text className="mt-4 text-sm text-brand-600">
              {t('circle.preferredLanguage', {
                code: activeLearner.preferred_language.toUpperCase(),
              })}
              {activeVerse.meaning?.isFallback ? t('circle.englishUntilReady') : ''}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                preferences.showTranslation
                  ? t('circle.hideFromPlayer')
                  : t('circle.showInPlayer')
              }
              onPress={() => {
                void setShowTranslation(!preferences.showTranslation);
              }}
              className="mt-4 min-h-11 items-center justify-center rounded-xl bg-brand-50 px-4 py-3"
            >
              <Text className="text-sm font-semibold text-brand-700">
                {preferences.showTranslation
                  ? t('circle.hideFromPlayer')
                  : t('circle.showInPlayer')}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {activeTab === 'leaderboard' ? (
          <View className="rounded-2xl bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('circle.standings')}
            </Text>
            <Text className="mt-2 text-sm text-brand-600">
              {t('circle.standingsHelp')}
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
                        {t('circle.dayStreak', { count: entry.streak })}
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-brand-700">
                      {entry.points} XP
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View className="mt-4">
              <PrimaryButton
                label={t('circle.openLeaderboard')}
                onPress={() => router.push('/(app)/leaderboard' as never)}
              />
            </View>
          </View>
        ) : null}

        <View className="mt-6 rounded-2xl bg-white px-4 py-4">
          <PrimaryButton
            label={t('circle.openFullReader')}
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
            label={t('circle.continueLesson')}
            onPress={() => router.push('/(app)/lesson')}
            variant="secondary"
          />
        </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
