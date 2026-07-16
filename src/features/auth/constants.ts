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
