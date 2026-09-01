import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { getOrCreateParticipantKey } from '@/features/competition/services/participantKey';
import { supabase } from '@/lib/supabase';

import {
  GUEST_LIMIT_SURAHS,
  GUEST_MILESTONE_SURAHS,
  type AgeGroupId,
} from '../constants';
import { AuthFunctionError, assertFunctionOk } from './functionErrors';

const GUEST_PROFILE_KEY = 'qq.guest.profile';
const GUEST_PROGRESS_KEY = 'qq.guest.progress';
const GUEST_MILESTONE_DISMISSED_KEY = 'qq.guest.milestone_dismissed';
/** Explicit Guest Mode flag — restored locally, independent of Supabase Auth. */
const GUEST_SESSION_KEY = 'qq.guest.session_active';
/** Nicknames already used on this device — kept after Guest Mode ends. */
const GUEST_USED_NAMES_KEY = 'qq.guest.used_names';
export const GUEST_NAME_TAKEN = 'guest_name_taken';
export const GUEST_NAME_CHECK_FAILED = 'guest_name_check_failed';
const GUEST_MIGRATION_PREFIX = 'qq.migrated_progress.';
/** Staged separately so Feature 005 reader merge does not race Feature 004 learning merge. */
const GUEST_READER_MIGRATION_PREFIX = 'qq.migrated_reader.';
const GUEST_READER_PREFS_PREFIX = 'qq.reader.prefs.';
const GUEST_READER_STATE_PREFIX = 'qq.reader.state.';

export type GuestProfile = {
  id: string;
  displayName: string;
  ageGroup: AgeGroupId;
  countryCode: string;
  preferredLanguage: string;
  createdAt: string;
};

export type GuestProgress = {
  /** Count of Juz 30 surahs the guest has meaningfully engaged with. */
  juz30SurahsCompleted: number;
  /** Opaque local progress blob for future learning features to merge on register. */
  learningPayload: Record<string, unknown>;
  updatedAt: string;
};

function emptyProgress(): GuestProgress {
  return {
    juz30SurahsCompleted: 0,
    learningPayload: {},
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeGuestDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isReservedFounderNickname(name: string): boolean {
  return normalizeGuestDisplayName(name) === 'founder';
}

export function guestDisplayNameConflicts(options: {
  normalizedName: string;
  reservedNames: string[];
  currentGuestId: string | null;
  savingGuestId: string | undefined;
  currentNormalizedName: string | null;
}): boolean {
  if (!options.normalizedName) {
    return false;
  }
  const keepingOwnName =
    Boolean(options.savingGuestId) &&
    options.savingGuestId === options.currentGuestId &&
    options.currentNormalizedName === options.normalizedName;
  if (keepingOwnName) {
    return false;
  }
  return options.reservedNames.includes(options.normalizedName);
}

export class GuestNameTakenError extends Error {
  readonly code = GUEST_NAME_TAKEN;

  constructor() {
    super(GUEST_NAME_TAKEN);
    this.name = 'GuestNameTakenError';
  }
}

export class GuestNameCheckError extends Error {
  readonly code = GUEST_NAME_CHECK_FAILED;

  constructor() {
    super(GUEST_NAME_CHECK_FAILED);
    this.name = 'GuestNameCheckError';
  }
}

export function isGuestNameTakenError(error: unknown): boolean {
  return (
    error instanceof GuestNameTakenError ||
    (error instanceof Error && error.message === GUEST_NAME_TAKEN)
  );
}

export function isGuestNameCheckError(error: unknown): boolean {
  return (
    error instanceof GuestNameCheckError ||
    (error instanceof Error && error.message === GUEST_NAME_CHECK_FAILED)
  );
}

async function claimGuestDisplayNameGlobally(
  displayName: string,
  accessCode?: string,
): Promise<void> {
  const participant_key = await getOrCreateParticipantKey();
  try {
    await assertFunctionOk(
      await supabase.functions.invoke('guest-name', {
        body: {
          display_name: displayName,
          participant_key,
          ...(accessCode ? { access_code: accessCode } : {}),
        },
      }),
    );
  } catch (error) {
    if (
      error instanceof AuthFunctionError &&
      (error.message === 'name_taken' || error.status === 409)
    ) {
      throw new GuestNameTakenError();
    }
    throw new GuestNameCheckError();
  }
}

async function loadReservedGuestNames(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(GUEST_USED_NAMES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
  } catch {
    return [];
  }
}

async function reserveGuestDisplayName(name: string): Promise<void> {
  const normalized = normalizeGuestDisplayName(name);
  if (!normalized) {
    return;
  }
  const reserved = await loadReservedGuestNames();
  if (reserved.includes(normalized)) {
    return;
  }
  await AsyncStorage.setItem(GUEST_USED_NAMES_KEY, JSON.stringify([...reserved, normalized]));
}

export function resolveGuestSessionActive(
  flag: string | null,
  hasProfile: boolean,
): boolean {
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  // Legacy guests persisted a profile before the dedicated session flag existed.
  return hasProfile;
}

async function markGuestSessionActive(): Promise<void> {
  await AsyncStorage.setItem(GUEST_SESSION_KEY, 'true');
}

async function markGuestSessionEnded(): Promise<void> {
  await AsyncStorage.setItem(GUEST_SESSION_KEY, 'false');
}

export async function isGuestSessionActive(): Promise<boolean> {
  const flag = await AsyncStorage.getItem(GUEST_SESSION_KEY);
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  const profile = await getGuestProfile();
  const active = resolveGuestSessionActive(flag, Boolean(profile));
  if (active) {
    await markGuestSessionActive();
  }
  return active;
}

/** Local Guest Mode profile when the persisted session flag is active. */
export async function getActiveGuestProfile(): Promise<GuestProfile | null> {
  const active = await isGuestSessionActive();
  if (!active) {
    return null;
  }
  const profile = await getGuestProfile();
  if (!profile) {
    await markGuestSessionEnded();
    return null;
  }
  return profile;
}

export async function getGuestProfile(): Promise<GuestProfile | null> {
  const raw = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as GuestProfile;
  } catch {
    return null;
  }
}

export async function updateGuestPreferredLanguage(
  language: string,
): Promise<GuestProfile | null> {
  const current = await getGuestProfile();
  if (!current) {
    return null;
  }
  return saveGuestProfile({
    ...current,
    preferredLanguage: language.trim().toLowerCase(),
  });
}

export async function saveGuestProfile(
  input: Omit<GuestProfile, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
    accessCode?: string;
  },
): Promise<GuestProfile> {
  const current = await getGuestProfile();
  const normalizedName = normalizeGuestDisplayName(input.displayName);
  const reservedNames = await loadReservedGuestNames();
  if (
    !isReservedFounderNickname(input.displayName) &&
    guestDisplayNameConflicts({
      normalizedName,
      reservedNames,
      currentGuestId: current?.id ?? null,
      savingGuestId: input.id,
      currentNormalizedName: current ? normalizeGuestDisplayName(current.displayName) : null,
    })
  ) {
    throw new GuestNameTakenError();
  }

  const nameChanged =
    !current || normalizeGuestDisplayName(current.displayName) !== normalizedName;
  if (nameChanged) {
    await claimGuestDisplayNameGlobally(input.displayName.trim(), input.accessCode);
  }

  const profile: GuestProfile = {
    id: input.id ?? Crypto.randomUUID(),
    displayName: input.displayName.trim(),
    ageGroup: input.ageGroup,
    countryCode: input.countryCode.toUpperCase(),
    preferredLanguage: input.preferredLanguage.trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  await AsyncStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  await reserveGuestDisplayName(profile.displayName);
  await markGuestSessionActive();

  const existingProgress = await AsyncStorage.getItem(GUEST_PROGRESS_KEY);
  if (!existingProgress) {
    await saveGuestProgress(emptyProgress());
  }
  await AsyncStorage.removeItem(GUEST_MILESTONE_DISMISSED_KEY);

  return profile;
}

export async function clearGuestProfile(): Promise<void> {
  await markGuestSessionEnded();
  await AsyncStorage.multiRemove([
    GUEST_PROFILE_KEY,
    GUEST_PROGRESS_KEY,
    GUEST_MILESTONE_DISMISSED_KEY,
  ]);
}

export async function getGuestProgress(): Promise<GuestProgress> {
  const raw = await AsyncStorage.getItem(GUEST_PROGRESS_KEY);
  if (!raw) {
    return emptyProgress();
  }
  try {
    return JSON.parse(raw) as GuestProgress;
  } catch {
    return emptyProgress();
  }
}

export async function saveGuestProgress(progress: GuestProgress): Promise<void> {
  await AsyncStorage.setItem(
    GUEST_PROGRESS_KEY,
    JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }),
  );
}

/** Used by learning features (and home stub) to update local guest progress. */
export async function recordGuestSurahProgress(
  surahsCompleted: number,
): Promise<GuestProgress> {
  const current = await getGuestProgress();
  const next: GuestProgress = {
    ...current,
    juz30SurahsCompleted: Math.min(
      GUEST_LIMIT_SURAHS,
      Math.max(current.juz30SurahsCompleted, surahsCompleted),
    ),
    updatedAt: new Date().toISOString(),
  };
  await saveGuestProgress(next);
  return next;
}

export async function addGuestSurahProgress(delta = 1): Promise<GuestProgress> {
  const current = await getGuestProgress();
  return recordGuestSurahProgress(current.juz30SurahsCompleted + Math.max(0, delta));
}

export function hasReachedGuestMilestone(progress: GuestProgress): boolean {
  return progress.juz30SurahsCompleted >= GUEST_MILESTONE_SURAHS;
}

export function hasReachedGuestLimit(progress: GuestProgress): boolean {
  return progress.juz30SurahsCompleted >= GUEST_LIMIT_SURAHS;
}

export async function isMilestoneDismissed(): Promise<boolean> {
  const value = await AsyncStorage.getItem(GUEST_MILESTONE_DISMISSED_KEY);
  return value === 'true';
}

export async function dismissMilestonePrompt(): Promise<void> {
  await AsyncStorage.setItem(GUEST_MILESTONE_DISMISSED_KEY, 'true');
}

/**
 * Migration hook: stages local guest progress against a new account id.
 * Also stages Feature 005 reader preferences / browse state for empty-only cloud merge.
 */
export async function transferGuestProgressToAccount(userId: string): Promise<{
  userId: string;
  progress: GuestProgress;
  guestProfile: GuestProfile | null;
  migrated: boolean;
}> {
  const guestProfile = await getGuestProfile();
  const progress = await getGuestProgress();

  if (!guestProfile) {
    return { userId, progress, guestProfile: null, migrated: false };
  }

  const migratedAt = new Date().toISOString();

  await AsyncStorage.setItem(
    `${GUEST_MIGRATION_PREFIX}${userId}`,
    JSON.stringify({
      guestProfile,
      progress,
      migratedAt,
    }),
  );

  const prefsKey = `${GUEST_READER_PREFS_PREFIX}${guestProfile.id}`;
  const stateKey = `${GUEST_READER_STATE_PREFIX}${guestProfile.id}`;
  const prefsRaw = await AsyncStorage.getItem(prefsKey);
  const stateRaw = await AsyncStorage.getItem(stateKey);
  let readerPreferences: unknown | null = null;
  let readerBrowseState: unknown | null = null;
  try {
    readerPreferences = prefsRaw ? (JSON.parse(prefsRaw) as unknown) : null;
  } catch {
    readerPreferences = null;
  }
  try {
    readerBrowseState = stateRaw ? (JSON.parse(stateRaw) as unknown) : null;
  } catch {
    readerBrowseState = null;
  }

  await AsyncStorage.setItem(
    `${GUEST_READER_MIGRATION_PREFIX}${userId}`,
    JSON.stringify({
      guestId: guestProfile.id,
      readerPreferences,
      readerBrowseState,
      migratedAt,
    }),
  );
  await AsyncStorage.multiRemove([prefsKey, stateKey]);

  try {
    const { stageGuestGamesForMigration } = await import('@/features/games');
    await stageGuestGamesForMigration(userId);
  } catch {
    // Games progress staging is best-effort; learning migration must still succeed.
  }

  await clearGuestProfile();

  return { userId, progress, guestProfile, migrated: true };
}
