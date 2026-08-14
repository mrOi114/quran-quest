import type { Profile, ProfileRole } from '@/types';

import type { AgeGroupId } from './constants';

export type AdultOrParentRole = Extract<ProfileRole, 'adult' | 'parent'>;

export type AuthFormError = {
  message: string;
  field?: string;
};

export type FamilyMember = Pick<
  Profile,
  | 'id'
  | 'role'
  | 'display_name'
  | 'age'
  | 'avatar_key'
  | 'country_code'
  | 'preferred_language'
  | 'parent_id'
>;

export type GuestLearner = {
  id: string;
  role: 'guest';
  display_name: string;
  age: null;
  age_group: AgeGroupId;
  avatar_key: string;
  country_code: string;
  preferred_language: string;
  parent_id: null;
};

/** Child unlocked via family code on a device without a parent email session. */
export type ChildFamilyLearner = FamilyMember & {
  role: 'child';
  session_mode: 'family_code';
};

export type ActiveLearner = FamilyMember | GuestLearner | ChildFamilyLearner;

export function isGuestLearner(
  learner: ActiveLearner | null | undefined,
): learner is GuestLearner {
  return learner?.role === 'guest';
}

export function isChildFamilyLearner(
  learner: ActiveLearner | null | undefined,
): learner is ChildFamilyLearner {
  return (
    learner?.role === 'child' &&
    'session_mode' in learner &&
    learner.session_mode === 'family_code'
  );
}

export type CreateChildInput = {
  displayName: string;
  age: number;
  avatarKey?: string;
  countryCode: string;
  preferredLanguage: string;
  pin: string;
};

export type UpdateChildInput = {
  displayName: string;
  age: number;
  avatarKey: string;
  countryCode: string;
  preferredLanguage: string;
};
