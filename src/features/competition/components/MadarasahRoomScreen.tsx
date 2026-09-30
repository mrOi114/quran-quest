import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import {
  enterMadarasahRoom,
  joinMadarasahChallenge,
  leaveMadarasahRoom,
  madarasahStatus,
} from '../services/madarasahService';
import { resolveCompetitionAgeBand } from '../services/ageBand';
import { clearActiveChallengeCode } from '../services/activeRoom';
import { localizeCompetitionError } from '../services/competitionService';
import { DEFAULT_QURAN_RANGE, isQuranRangePlayable, type QuranRangeId } from '../services/quranRange';
import { MadarasahComms } from './MadarasahComms';
import { QuranRangePicker } from './QuranRangePicker';

export function MadarasahRoomScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { activeLearner } = useAuth();
  const [phase, setPhase] = useState<'loading' | 'locked' | 'open'>('loading');
  const [code, setCode] = useState('');
  const [codeVisible, setCodeVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [quranRange, setQuranRange] = useState<QuranRangeId>(DEFAULT_QURAN_RANGE);
  const roomName = t('competition.madarasahTitle');

  useEffect(() => {
    let cancelled = false;
    void madarasahStatus()
      .then((status) => {
        if (!cancelled) {
          setPhase(status.member ? 'open' : 'locked');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhase('locked');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function enter() {
    if (!activeLearner) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await enterMadarasahRoom(code, {
        displayLabel: activeLearner.display_name,
        profileId: activeLearner.role === 'guest' ? null : activeLearner.id,
      });
      setCode('');
      setPhase('open');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'code_denied';
      setError(
        message === 'not_found' || message === 'room_unavailable'
          ? t('competition.madarasahUnavailable')
          : localizeCompetitionError(message, (key) => t(key)),
      );
      setPhase('locked');
    } finally {
      setBusy(false);
    }
  }

  async function startChallenge() {
    if (!activeLearner || !isQuranRangePlayable(quranRange)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const state = await joinMadarasahChallenge(
        {
          displayLabel: activeLearner.display_name,
          profileId: activeLearner.role === 'guest' ? null : activeLearner.id,
          ageBand: resolveCompetitionAgeBand(activeLearner),
        },
        quranRange,
      );
      router.push({
        pathname: '/(app)/competition/[code]',
        params: { code: state.challenge.code },
      } as unknown as Href);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'error';
      setError(localizeCompetitionError(message, (key) => t(key)));
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    setBusy(true);
    try {
      await leaveMadarasahRoom();
      await clearActiveChallengeCode();
    } catch {
      // The server membership is already gone if this fails after a successful leave.
    } finally {
      setBusy(false);
      setPhase('locked');
      setCode('');
      router.replace('/(app)/competition' as Href);
    }
  }

  if (phase === 'loading') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-white">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('nav.competition')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{roomName}</Text>

        {phase === 'locked' ? (
          <View className="mt-5 rounded-3xl bg-white px-5 py-5">
            <Text className="text-base text-brand-700">{t('competition.madarasahHelp')}</Text>
            <View className="mt-4 mb-4">
              <Text className="mb-2 text-sm font-medium text-brand-800">{t('competition.madarasahCode')}</Text>
              <View className="flex-row items-center rounded-xl border border-brand-100 bg-brand-50">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  secureTextEntry={!codeVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  accessibilityLabel={t('competition.madarasahCode')}
                  className="min-h-12 flex-1 px-4 py-3 text-base text-brand-900"
                  placeholderTextColor="#6BC2A2"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    codeVisible ? t('competition.madarasahHideCode') : t('competition.madarasahShowCode')
                  }
                  onPress={() => setCodeVisible((visible) => !visible)}
                  className="min-h-12 items-center justify-center px-4"
                >
                  <Text className="text-sm font-semibold text-brand-700">
                    {codeVisible ? t('competition.madarasahHideCode') : t('competition.madarasahShowCode')}
                  </Text>
                </Pressable>
              </View>
            </View>
            <PrimaryButton
              label={t('competition.madarasahEnter')}
              loading={busy}
              disabled={code.trim().length < 4}
              onPress={() => {
                void enter();
              }}
            />
            {error ? <Text className="text-sm text-red-700">{error}</Text> : null}
          </View>
        ) : (
          <>
            <View className="mt-5 rounded-3xl bg-white px-5 py-5">
              <QuranRangePicker value={quranRange} onChange={setQuranRange} />
              <PrimaryButton
                label={t('competition.startChallenge')}
                loading={busy}
                disabled={!isQuranRangePlayable(quranRange)}
                onPress={() => {
                  void startChallenge();
                }}
              />
              {error ? <Text className="text-sm text-red-700">{error}</Text> : null}
            </View>
            <MadarasahComms />
            <View className="mt-5 rounded-3xl bg-white px-5 py-5">
              <PrimaryButton
                label={t('competition.leaveCompetition')}
                variant="secondary"
                loading={busy}
                onPress={() => {
                  void leave();
                }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
