import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton, TextField, useAuth } from '@/features/auth';
import { useI18n, type MessageKey } from '@/i18n';

import { submitStudentFeedback } from '../services/feedbackService';
import type { FeedbackCategory } from '../types';

const CATEGORIES: FeedbackCategory[] = ['idea', 'problem', 'praise'];
const CATEGORY_KEY: Record<FeedbackCategory, MessageKey> = {
  idea: 'feedback.idea',
  problem: 'feedback.problem',
  praise: 'feedback.praise',
};

export function StudentFeedbackModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t, language } = useI18n();
  const { activeLearner, isGuest } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>('idea');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function resetAndClose() {
    setCategory('idea');
    setMessage('');
    setError(null);
    setSent(false);
    setLoading(false);
    onClose();
  }

  async function onSubmit() {
    setError(null);
    const trimmed = message.trim();
    if (trimmed.length < 8) {
      setError(t('feedback.tooShort'));
      return;
    }
    setLoading(true);
    try {
      await submitStudentFeedback({
        category,
        message: trimmed,
        displayName: activeLearner?.display_name ?? '',
        isGuest,
        language,
      });
      setSent(true);
    } catch {
      setError(t('feedback.sendError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="max-h-[86%] w-full rounded-3xl bg-white px-5 py-6">
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text className="text-2xl font-semibold text-brand-800">{t('feedback.title')}</Text>
            {sent ? (
              <>
                <Text className="mt-3 text-base leading-6 text-brand-700">{t('feedback.thanks')}</Text>
                <View className="mt-6">
                  <PrimaryButton label={t('common.done')} onPress={resetAndClose} />
                </View>
              </>
            ) : (
              <>
                <Text className="mt-3 text-base leading-6 text-brand-700">{t('feedback.help')}</Text>
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {CATEGORIES.map((item) => {
                    const selected = category === item;
                    return (
                      <Pressable
                        key={item}
                        accessibilityRole="button"
                        onPress={() => setCategory(item)}
                        className={`rounded-full border px-3 py-2 ${
                          selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
                        }`}
                      >
                        <Text className="text-sm font-semibold text-brand-800">
                          {t(CATEGORY_KEY[item])}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View className="mt-4">
                  <TextField
                    label={t('feedback.message')}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    style={{ minHeight: 120 }}
                    error={error ?? undefined}
                  />
                </View>
                <PrimaryButton
                  label={t('feedback.send')}
                  loading={loading}
                  onPress={() => {
                    void onSubmit();
                  }}
                />
                <PrimaryButton
                  label={t('common.back')}
                  variant="secondary"
                  onPress={resetAndClose}
                />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
