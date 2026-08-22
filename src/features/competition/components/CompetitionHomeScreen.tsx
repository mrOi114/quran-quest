import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, TextField, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useCompetitionChallenge } from '../hooks/useCompetitionChallenge';
import { resolveCompetitionAgeBand } from '../services';

export function CompetitionHomeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { activeLearner } = useAuth();
  const { joinPublic, createInvite, joinCode, joining, error } = useCompetitionChallenge();
  const [code, setCode] = useState('');

  const ageBand = activeLearner ? resolveCompetitionAgeBand(activeLearner) : null;

  async function go(nextCode: string | undefined) {
    if (!nextCode) return;
    router.push({
      pathname: '/(app)/competition/[code]',
      params: { code: nextCode },
    } as Href);
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
        <Text className="mt-2 text-3xl font-bold text-white">{t('competition.title')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('competition.subtitle')}</Text>

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          {ageBand ? (
            <Text className="mb-4 text-sm text-brand-600">
              {t('competition.matchedGroup', {
                group:
                  ageBand === 'child'
                    ? t('competition.groupChild')
                    : ageBand === 'teen'
                      ? t('competition.groupTeen')
                      : t('competition.groupAdult'),
              })}
            </Text>
          ) : null}

          <PrimaryButton
            label={t('competition.joinPublic')}
            loading={joining}
            onPress={() => {
              void joinPublic().then((state) => go(state?.challenge.code));
            }}
          />
          <Text className="mb-4 text-sm leading-5 text-brand-600">
            {t('competition.publicHelp')}
          </Text>

          <PrimaryButton
            label={t('competition.invite')}
            variant="secondary"
            loading={joining}
            onPress={() => {
              void createInvite().then((state) => go(state?.challenge.code));
            }}
          />
          <Text className="mb-4 text-sm leading-5 text-brand-600">
            {t('competition.inviteHelp')}
          </Text>

          <TextField
            label={t('competition.enterCode')}
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel={t('competition.enterCode')}
          />
          <Pressable
            accessibilityRole="button"
            disabled={joining}
            onPress={() => {
              void joinCode(code).then((state) => go(state?.challenge.code));
            }}
            className="min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-3"
          >
            <Text className="text-sm font-semibold text-brand-700">
              {t('competition.joinWithCode')}
            </Text>
          </Pressable>

          {error ? <Text className="mt-4 text-sm text-red-700">{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
