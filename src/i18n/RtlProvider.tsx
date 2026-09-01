import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';

import { applyUiDirection } from './rtl';
import { useI18n } from './useI18n';

export function RtlProvider({ children }: { children: ReactNode }) {
  const { language, isRtl } = useI18n();

  useEffect(() => {
    applyUiDirection(language);
  }, [language]);

  return (
    <View
      collapsable={false}
      style={{ flex: 1, direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {children}
    </View>
  );
}
