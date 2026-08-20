import { t, type MessageKey } from '@/i18n';
import { CONTACT_SAFETY_MESSAGE } from '@/constants/groupLimits';

const KNOWN_ERRORS: Record<string, MessageKey> = {
  'Access denied': 'groups.accessDenied',
  'Not authenticated': 'groups.signInNeeded',
  'Enter a circle name': 'groups.enterName',
  'Enter a valid join code': 'groups.enterCode',
  'Circle code not found': 'groups.codeNotFound',
  'This circle already has the maximum number of members': 'groups.full',
  'This family group already has the maximum number of members': 'familyGroup.full',
  'Only adults and parents can create a Public Circle': 'groups.adultsOnlyPublic',
  'Only an approved teacher can create a Madrasah / Dugsi Circle': 'groups.teacherOnlyMadrasah',
  'Only an approved teacher can approve another teacher': 'groups.teacherApproveOnly',
  'Only adults and parents can request teacher permission': 'groups.adultsOnlyTeacher',
  'Children cannot join this circle by themselves. Ask a parent to connect you.':
    'groups.childNeedsParent',
  'Join this circle first, then connect your child': 'groups.joinThenChild',
  'Group chat is turned off': 'groups.chatOff',
  'Only an admin can do that': 'groups.adminOnly',
  'Only an approved teacher or admin can do that': 'groups.teacherAdminOnly',
  'Audio calling stays off in Public Circles': 'groups.publicAudioOff',
  'You cannot rejoin this circle': 'groups.permanentRemove',
  'This child cannot rejoin this circle': 'groups.permanentRemove',
  'Only an adult or parent can create a Family Group': 'familyGroup.adultsOnly',
  [CONTACT_SAFETY_MESSAGE]: 'groups.contactBlocked',
  'You have been temporarily removed from this group for 1 hour. You can join again after the timeout ends.':
    'groups.timeout',
};

export function localizeGroupError(
  message: string | null | undefined,
  language: string | null | undefined,
  fallbackKey: MessageKey = 'groups.accessDenied',
): string {
  if (!message) {
    return t(fallbackKey, language);
  }
  const key = KNOWN_ERRORS[message];
  if (key) {
    return t(key, language);
  }
  return message;
}
