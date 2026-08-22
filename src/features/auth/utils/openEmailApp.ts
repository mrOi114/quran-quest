import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/**
 * Opens the device mail app (or webmail on web) so the parent can find the code/link.
 */
export async function openEmailApp(): Promise<void> {
  if (Platform.OS === 'web') {
    await Linking.openURL('https://mail.google.com');
    return;
  }

  if (Platform.OS === 'ios') {
    try {
      await Linking.openURL('message://');
      return;
    } catch {
      // Fall through to mailto if Mail is unavailable.
    }
  }

  await Linking.openURL('mailto:');
}
