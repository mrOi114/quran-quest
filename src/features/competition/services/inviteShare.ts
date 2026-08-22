import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

import { PRODUCTION_WEB_ORIGIN } from '../constants';

export function buildChallengeUrl(code: string): string {
  if (Platform.OS === 'web' && typeof globalThis.location?.origin === 'string') {
    return `${globalThis.location.origin}/challenge/${code}`;
  }
  const created = Linking.createURL(`/challenge/${code}`);
  if (created.startsWith('http://') || created.startsWith('https://')) {
    return created;
  }
  return `${PRODUCTION_WEB_ORIGIN}/challenge/${code}`;
}

export async function shareChallengeInvite(message: string): Promise<'shared' | 'copied'> {
  try {
    const result = await Share.share({ message });
    if (result.action === Share.dismissedAction) {
      return 'shared';
    }
    return 'shared';
  } catch {
    if (Platform.OS === 'web' && globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(message);
      return 'copied';
    }
    throw new Error('Could not open the device share sheet');
  }
}

export function buildInviteMessage(options: {
  title: string;
  challengeLine: string;
  detailsLine: string;
  joinLine: string;
  url: string;
  codeLine: string;
}): string {
  return [
    options.title,
    '',
    options.challengeLine,
    '',
    options.detailsLine,
    '',
    options.joinLine,
    options.url,
    '',
    options.codeLine,
  ].join('\n');
}
