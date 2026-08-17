import { Platform } from 'react-native';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

import { getDeviceKey } from '@/features/auth/services/deviceService';

type NotificationModule = typeof import('expo-notifications');

let notificationsModule: NotificationModule | null | undefined;

async function loadNotifications(): Promise<NotificationModule | null> {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }
  try {
    notificationsModule = await import('expo-notifications');
    return notificationsModule;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export async function requestFamilyNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (Notifications) {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    const asked = await Notifications.requestPermissionsAsync();
    return Boolean(
      asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    );
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    return true;
  }
  if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export async function registerFamilyCallCategory(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications?.setNotificationCategoryAsync) {
    return;
  }
  await Notifications.setNotificationCategoryAsync('family_call', [
    {
      identifier: 'accept',
      buttonTitle: 'Accept',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'decline',
      buttonTitle: 'Decline',
      options: { isDestructive: true, opensAppToForeground: false },
    },
  ]);
}

export async function registerFamilyPushToken(profileId: string): Promise<void> {
  const allowed = await requestFamilyNotificationPermission();
  if (!allowed) {
    return;
  }

  const Notifications = await loadNotifications();
  if (!Notifications?.getExpoPushTokenAsync) {
    return;
  }

  const projectId = env.easProjectId || undefined;
  try {
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const deviceKey = await getDeviceKey();
    await supabase.from('family_push_tokens').upsert(
      {
        profile_id: profileId,
        device_key: deviceKey,
        expo_push_token: token.data,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,device_key' },
    );
  } catch {
    // Push is best-effort. In-app realtime still delivers chat/call alerts.
  }
}

export async function notifyFamilyEvent(options: {
  kind: 'message' | 'call';
  familyId: string;
  recipientIds: string[];
  title: string;
  body: string;
  callId?: string;
}): Promise<void> {
  try {
    await supabase.functions.invoke('send-family-push', {
      body: {
        kind: options.kind,
        family_id: options.familyId,
        recipient_ids: options.recipientIds,
        title: options.title,
        body: options.body,
        call_id: options.callId,
      },
    });
  } catch {
    // In-app realtime remains the reliable path.
  }
}

export function showLocalFamilyNotification(title: string, body: string): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return;
  }
  try {
    new Notification(title, { body });
  } catch {
    // Ignore browsers that block constructed notifications without a service worker.
  }
}
