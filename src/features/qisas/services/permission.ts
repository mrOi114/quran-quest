import { PUBLISHABLE_PERMISSION_STATUSES } from '../constants';
import type { QisasAudioSlot, QisasPermissionStatus } from '../schemas';

export function isPublishablePermission(
  status: QisasPermissionStatus,
): boolean {
  return (PUBLISHABLE_PERMISSION_STATUSES as readonly string[]).includes(status);
}

/**
 * Only PERMISSION_GRANTED or LICENSED audio with a real URL may play.
 * Empty slots stay “coming soon”. Never hotlink unlicensed hosts.
 */
export function isLicensedAudioSlot(slot: QisasAudioSlot): boolean {
  return (
    isPublishablePermission(slot.permissionStatus) &&
    typeof slot.audioUrl === 'string' &&
    slot.audioUrl.trim().length > 0
  );
}

export function licensedAudioUrl(slot: QisasAudioSlot): string | null {
  return isLicensedAudioSlot(slot) ? slot.audioUrl : null;
}
