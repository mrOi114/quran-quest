import { I18nManager, Platform } from 'react-native';

import { isRtlUi, type UiLanguage } from './translate';

export function applyUiDirection(language: UiLanguage): void {
  const rtl = isRtlUi(language);

  try {
    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(true);
    I18nManager.forceRTL(rtl);
  } catch {
    // I18nManager is unavailable in some tests and web runtimes.
  }

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    document.body.setAttribute('dir', dir);
  }
}
