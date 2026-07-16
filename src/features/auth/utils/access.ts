import type { AccountRequiredFeature } from '../constants';

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
