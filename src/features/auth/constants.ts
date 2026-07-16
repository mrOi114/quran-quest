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

/** Simple avatar keys for V1 child/guest identity (Feature 002 may expand). */
export const AVATAR_OPTIONS = [
  { key: 'default-1', label: 'Olive' },
  { key: 'default-2', label: 'Sky' },
  { key: 'default-3', label: 'Sand' },
  { key: 'default-4', label: 'Rose' },
  { key: 'default-5', label: 'Mint' },
  { key: 'default-6', label: 'Amber' },
] as const;

export type AvatarKey = (typeof AVATAR_OPTIONS)[number]['key'];

/** Common countries with flag emoji for selection UI (ISO 3166-1 alpha-2). */
export const COUNTRY_OPTIONS = [
  { code: 'US', flag: '🇺🇸', label: 'United States' },
  { code: 'GB', flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'CA', flag: '🇨🇦', label: 'Canada' },
  { code: 'AU', flag: '🇦🇺', label: 'Australia' },
  { code: 'SO', flag: '🇸🇴', label: 'Somalia' },
  { code: 'KE', flag: '🇰🇪', label: 'Kenya' },
  { code: 'NG', flag: '🇳🇬', label: 'Nigeria' },
  { code: 'EG', flag: '🇪🇬', label: 'Egypt' },
  { code: 'SA', flag: '🇸🇦', label: 'Saudi Arabia' },
  { code: 'AE', flag: '🇦🇪', label: 'United Arab Emirates' },
  { code: 'PK', flag: '🇵🇰', label: 'Pakistan' },
  { code: 'BD', flag: '🇧🇩', label: 'Bangladesh' },
  { code: 'IN', flag: '🇮🇳', label: 'India' },
  { code: 'MY', flag: '🇲🇾', label: 'Malaysia' },
  { code: 'ID', flag: '🇮🇩', label: 'Indonesia' },
  { code: 'TR', flag: '🇹🇷', label: 'Türkiye' },
  { code: 'FR', flag: '🇫🇷', label: 'France' },
  { code: 'DE', flag: '🇩🇪', label: 'Germany' },
  { code: 'NL', flag: '🇳🇱', label: 'Netherlands' },
  { code: 'SE', flag: '🇸🇪', label: 'Sweden' },
] as const;

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'so', label: 'Somali' },
  { code: 'fr', label: 'French' },
  { code: 'ur', label: 'Urdu' },
  { code: 'tr', label: 'Turkish' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
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
