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

export type ActiveLearner = FamilyMember | GuestLearner;

export function isGuestLearner(
  learner: ActiveLearner | null | undefined,
): learner is GuestLearner {
  return learner?.role === 'guest';
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
