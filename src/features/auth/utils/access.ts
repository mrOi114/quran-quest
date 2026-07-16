import type { ProfileRole } from '@/types';

import type { AccountRequiredFeature } from '../constants';
import type { ActiveLearner } from '../types';

export function requiresAccount(
  feature: AccountRequiredFeature,
  options: { hasAccount: boolean },
): boolean {
  return !options.hasAccount;
}

export function canAccessAccountFeature(
  feature: AccountRequiredFeature,
  options: { hasAccount: boolean },
): boolean {
  return !requiresAccount(feature, options);
}

/**
 * Parent management (create children, reset PIN, family admin) must never
 * appear during an active child learning session.
 */
export function canManageFamily(options: {
  profileRole: ProfileRole | null | undefined;
  activeLearner: ActiveLearner | null | undefined;
}): boolean {
  if (options.profileRole !== 'parent') {
    return false;
  }
  if (!options.activeLearner) {
    // Family picker / no learner yet — parent may manage children.
    return true;
  }
  return options.activeLearner.role !== 'child' && options.activeLearner.role !== 'guest';
}

export function isChildActiveLearner(
  activeLearner: ActiveLearner | null | undefined,
): boolean {
  return activeLearner?.role === 'child';
}
