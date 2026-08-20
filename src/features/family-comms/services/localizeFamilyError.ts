import { t, type MessageKey } from '@/i18n';

const KNOWN_ERRORS: Record<string, MessageKey> = {
  'Access denied': 'chat.accessDenied',
  'Chat is turned off for this child. Ask a parent to enable it.': 'chat.turnedOff',
  'Calls are turned off for this child. Ask a parent to enable them.': 'call.turnedOff',
  'Microphone is not available on this device.': 'call.micUnavailable',
  'Voice calls are available in the web app on this device.': 'call.webOnly',
  'Write a short message': 'chat.writeShort',
  'Message is too long': 'chat.tooLong',
};

const PERMISSION_ERROR = /permission denied|notallowederror|not allowed by the user agent|getusermedia/i;

export function localizeFamilyError(
  message: string | null | undefined,
  language: string | null | undefined,
  fallbackKey: MessageKey = 'chat.accessDenied',
): string {
  if (!message) {
    return t(fallbackKey, language);
  }
  const key = KNOWN_ERRORS[message];
  if (key) {
    return t(key, language);
  }
  if (PERMISSION_ERROR.test(message)) {
    return t('call.permissionDenied', language);
  }
  return message;
}
