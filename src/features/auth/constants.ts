/** Juz 30 has 37 surahs (78–114). Half Juz 30 is the soft account-prompt milestone. */
export const GUEST_MILESTONE_SURAHS = 19;

/** Hard guest limit within Juz 30 before account is strongly encouraged. */
export const GUEST_LIMIT_SURAHS = 37;

export const AGE_GROUPS = [
  { id: 'child_3_6', label: 'Ages 3–6', minAge: 3, maxAge: 6 },
  { id: 'child_7_10', label: 'Ages 7–10', minAge: 7, maxAge: 10 },
  { id: 'child_11_14', label: 'Ages 11–14', minAge: 11, maxAge: 14 },
  { id: 'teen_15_17', label: 'Ages 15–17', minAge: 15, maxAge: 17 },
  { id: 'adult_18_plus', label: '18+', minAge: 18, maxAge: 120 },
] as const;

export type AgeGroupId = (typeof AGE_GROUPS)[number]['id'];

/**
 * Avatar keys for V1 identity.
 * girl-1 / boy-1 store Girl/Boy without a DB gender column (safe, no migration).
 */
export const AVATAR_OPTIONS = [
  { key: 'girl-1', label: 'Girl' },
  { key: 'boy-1', label: 'Boy' },
  { key: 'default-1', label: 'Olive' },
  { key: 'default-2', label: 'Sky' },
  { key: 'default-3', label: 'Sand' },
  { key: 'default-4', label: 'Rose' },
  { key: 'default-5', label: 'Mint' },
  { key: 'default-6', label: 'Amber' },
] as const;

export type AvatarKey = (typeof AVATAR_OPTIONS)[number]['key'];

export { COUNTRY_OPTIONS, findSelectableCountry, type CountryOption } from './data/countries';

export const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'so', flag: '🇸🇴', label: 'Somali / Af-Soomaali' },
  { code: 'fr', flag: '🇫🇷', label: 'French' },
  { code: 'ur', flag: '🇵🇰', label: 'Urdu' },
  { code: 'tr', flag: '🇹🇷', label: 'Turkish' },
  { code: 'id', flag: '🇮🇩', label: 'Indonesian' },
  { code: 'ms', flag: '🇲🇾', label: 'Malay' },
] as const;

export const ACCOUNT_REQUIRED_FEATURES = [
  'ai_hifz_circle',
  'cloud_backup',
  'multi_device_sync',
  'online_leaderboards',
  'parent_dashboard',
  'family_management',
  'teacher_features',
  'scholar_features',
] as const;

export type AccountRequiredFeature = (typeof ACCOUNT_REQUIRED_FEATURES)[number];
