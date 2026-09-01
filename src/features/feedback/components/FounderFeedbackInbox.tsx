import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useI18n, type MessageKey } from '@/i18n';

import { listStudentFeedback } from '../services/feedbackService';
import type { FeedbackCategory, StudentFeedbackItem } from '../types';

const CATEGORY_KEY: Record<FeedbackCategory, MessageKey> = {
  idea: 'feedback.idea',
  problem: 'feedback.problem',
  praise: 'feedback.praise',
};

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function FounderFeedbackInbox() {
  const router = useRouter();
  const { t } = useI18n();
  const [items, setItems] = useState<StudentFeedbackItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listStudentFeedback());
    } catch {
      setError(t('feedback.loadError'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('feedback.inboxEyebrow')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{t('feedback.inboxTitle')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('feedback.inboxHelp')}</Text>

        {loading ? <Text className="mt-6 text-base text-white">{t('common.loading')}</Text> : null}
        {error ? <Text className="mt-6 text-base text-red-100">{error}</Text> : null}
        {!loading && !error && items.length === 0 ? (
          <Text className="mt-6 text-base text-brand-100">{t('feedback.empty')}</Text>
        ) : null}

        {items.map((item) => (
          <View key={item.id} className="mt-4 rounded-3xl bg-white px-5 py-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {CATEGORY_KEY[item.category] ? t(CATEGORY_KEY[item.category]) : item.category}
            </Text>
            <Text className="mt-2 text-base font-semibold text-brand-800">
              {item.display_name?.trim() || t('feedback.anonymous')}
              {item.is_guest ? ` · ${t('common.guestMode')}` : ''}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">{formatWhen(item.created_at)}</Text>
            <Text className="mt-3 text-base leading-6 text-brand-800">{item.message}</Text>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(app)/home')}
          className="mt-6 min-h-12 items-center justify-center rounded-xl bg-white px-4"
        >
          <Text className="font-semibold text-brand-800">{t('common.backToHome')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
