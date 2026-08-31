import { useCallback, useRef, useState } from 'react';
import { Modal, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import { PrimaryButton } from './PrimaryButton';

export function GuestExitWarning({
  visible,
  onKeepLearning,
  onLeaveGuestMode,
}: {
  visible: boolean;
  onKeepLearning: () => void;
  onLeaveGuestMode: () => void;
}) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onKeepLearning}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('guest.exitTitle')}</Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">{t('guest.exitSavedHere')}</Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">{t('guest.exitIfLeave')}</Text>
          <View className="mt-2 gap-1">
            <Text className="text-base leading-6 text-brand-700">• {t('guest.exitItemXp')}</Text>
            <Text className="text-base leading-6 text-brand-700">• {t('guest.exitItemStats')}</Text>
            <Text className="text-base leading-6 text-brand-700">• {t('guest.exitItemLearning')}</Text>
          </View>
          <Text className="mt-3 text-base leading-6 text-brand-600">{t('guest.exitStaySafe')}</Text>
          <View className="mt-6">
            <PrimaryButton label={t('guest.keepLearning')} onPress={onKeepLearning} />
            <PrimaryButton
              label={t('guest.leaveGuestMode')}
              onPress={onLeaveGuestMode}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function useGuestExitWarning() {
  const [visible, setVisible] = useState(false);
  const leaveAction = useRef<(() => void) | null>(null);

  const requestGuestExit = useCallback((onLeave: () => void) => {
    leaveAction.current = onLeave;
    setVisible(true);
  }, []);

  const keepLearning = useCallback(() => {
    leaveAction.current = null;
    setVisible(false);
  }, []);

  const confirmLeave = useCallback(() => {
    const action = leaveAction.current;
    leaveAction.current = null;
    setVisible(false);
    action?.();
  }, []);

  return { guestExitVisible: visible, requestGuestExit, keepLearning, confirmLeave };
}
