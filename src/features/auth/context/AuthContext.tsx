import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import type { GuestOnboardingInput } from '../schemas';
import {
  addGuestSurahProgress,
  applyGuestIdentityToProfile,
  clearChildFamilySession,
  clearGuestProfile,
  clearStoredActiveLearnerId,
  createChildProfile,
  deleteChildProfile,
  dismissMilestonePrompt,
  ensureParentFamilyCode,
  fetchChildren,
  fetchProfile,
  getActiveGuestProfile,
  getGuestProfile,
  getGuestProgress,
  getInitialAuthUrl,
  getLastHandledAuthLinkKind,
  getSession,
  isAuthCallbackLocation,
  isAuthCallbackProcessing,
  isGuestSessionActive,
  getStoredActiveLearnerId,
  handleAuthRedirectUrl,
  hasReachedGuestLimit,
  hasReachedGuestMilestone,
  isEmailVerified,
  isMilestoneDismissed,
  loadChildFamilySession,
  logoutAccount,
  registerCurrentDevice,
  saveChildFamilySession,
  saveGuestProfile,
  setChildPin,
  setStoredActiveLearnerId,
  subscribeAuthCallbackProcessing,
  subscribeToAuthUrls,
  toChildFamilyLearner,
  transferGuestProgressToAccount,
  unlockChildWithFamilyCode,
  updateChildCommsSettings,
  updateChildProfile,
  updateGuestPreferredLanguage,
  updateProfilePreferredLanguage,
  verifyChildPin,
  type GuestProfile,
  type GuestProgress,
} from '../services';
import type {
  ActiveLearner,
  CreateChildInput,
  FamilyMember,
  GuestLearner,
  UpdateChildInput,
} from '../types';
import { isChildFamilyLearner } from '../types';
import { canManageFamily } from '../utils/access';

type AuthContextValue = {
  isBootstrapping: boolean;
  isAccountHydrating: boolean;
  isProcessingAuthCallback: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  children: Profile[];
  activeLearner: ActiveLearner | null;
  isEmailVerified: boolean;
  isGuest: boolean;
  /** Child unlocked via family code + PIN without a parent email session. */
  isChildFamilySession: boolean;
  guestProfile: GuestProfile | null;
  guestProgress: GuestProgress | null;
  showMilestonePrompt: boolean;
  isGuestAtLimit: boolean;
  /** True after a password-recovery deep link until the new password is saved. */
  needsPasswordReset: boolean;
  canManageFamily: boolean;
  familyCode: string | null;
  refreshProfile: () => Promise<void>;
  refreshChildren: () => Promise<void>;
  selectSelfAsLearner: () => Promise<void>;
  unlockChild: (childId: string, pin: string) => Promise<void>;
  unlockChildByFamilyCode: (
    familyCode: string,
    childId: string,
    pin: string,
  ) => Promise<void>;
  clearActiveLearner: () => Promise<void>;
  createChild: (input: CreateChildInput) => Promise<Profile>;
  updateChild: (childId: string, input: UpdateChildInput) => Promise<Profile>;
  deleteChild: (childId: string) => Promise<void>;
  resetChildPin: (childId: string, pin: string) => Promise<void>;
  updateChildComms: (
    childId: string,
    settings: { chatEnabled: boolean; callsEnabled: boolean },
  ) => Promise<void>;
  ensureFamilyCode: () => Promise<string>;
  signOut: () => Promise<void>;
  ensureDeviceRegistered: () => Promise<void>;
  startGuest: (input: GuestOnboardingInput) => Promise<void>;
  endGuestSession: () => Promise<void>;
  endChildFamilySession: () => Promise<void>;
  refreshGuestProgress: () => Promise<void>;
  simulateGuestProgress: (delta?: number) => Promise<void>;
  dismissGuestMilestone: () => Promise<void>;
  migrateGuestProgressAfterRegister: () => Promise<void>;
  clearPasswordResetFlag: () => void;
  setPreferredLanguage: (languageCode: string) => Promise<void>;
};

const missingAuthContextValue: AuthContextValue = {
  isBootstrapping: false,
  isAccountHydrating: false,
  isProcessingAuthCallback: false,
  session: null,
  user: null,
  profile: null,
  children: [],
  activeLearner: null,
  isEmailVerified: false,
  isGuest: false,
  isChildFamilySession: false,
  guestProfile: null,
  guestProgress: null,
  showMilestonePrompt: false,
  isGuestAtLimit: false,
  needsPasswordReset: false,
  canManageFamily: false,
  familyCode: null,
  refreshProfile: async () => undefined,
  refreshChildren: async () => undefined,
  selectSelfAsLearner: async () => undefined,
  unlockChild: async () => undefined,
  unlockChildByFamilyCode: async () => undefined,
  clearActiveLearner: async () => undefined,
  createChild: async () => undefined as never,
  updateChild: async () => undefined as never,
  deleteChild: async () => undefined,
  resetChildPin: async () => undefined,
  updateChildComms: async () => undefined,
  ensureFamilyCode: async () => '',
  signOut: async () => undefined,
  ensureDeviceRegistered: async () => undefined,
  startGuest: async () => undefined,
  endGuestSession: async () => undefined,
  endChildFamilySession: async () => undefined,
  refreshGuestProgress: async () => undefined,
  simulateGuestProgress: async () => undefined,
  dismissGuestMilestone: async () => undefined,
  migrateGuestProgressAfterRegister: async () => undefined,
  clearPasswordResetFlag: () => undefined,
  setPreferredLanguage: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(missingAuthContextValue);

function toFamilyMember(profile: Profile): FamilyMember {
  return {
    id: profile.id,
    role: profile.role,
    display_name: profile.display_name,
    age: profile.age,
    avatar_key: profile.avatar_key,
    country_code: profile.country_code,
    preferred_language: profile.preferred_language,
    parent_id: profile.parent_id,
  };
}

function guestToLearner(guest: GuestProfile): GuestLearner {
  return {
    id: guest.id,
    role: 'guest',
    display_name: guest.displayName,
    age: null,
    age_group: guest.ageGroup,
    avatar_key: 'default-1',
    country_code: guest.countryCode,
    preferred_language: guest.preferredLanguage,
    parent_id: null,
  };
}

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAccountHydrating, setIsAccountHydrating] = useState(false);
  const [isProcessingAuthCallback, setIsProcessingAuthCallback] = useState(
    () => isAuthCallbackProcessing() || isAuthCallbackLocation(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [childProfiles, setChildProfiles] = useState<Profile[]>([]);
  const [activeLearner, setActiveLearner] = useState<ActiveLearner | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [guestProgress, setGuestProgress] = useState<GuestProgress | null>(null);
  const [showMilestonePrompt, setShowMilestonePrompt] = useState(false);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const bootstrappedRef = useRef(false);
  const processingCallbackRef = useRef(isAuthCallbackProcessing() || isAuthCallbackLocation());
  sessionRef.current = session;
  processingCallbackRef.current = isProcessingAuthCallback;

  const syncGuestMilestone = useCallback(async (progress: GuestProgress | null) => {
    if (!progress) {
      setShowMilestonePrompt(false);
      return;
    }
    const dismissed = await isMilestoneDismissed();
    setShowMilestonePrompt(hasReachedGuestMilestone(progress) && !dismissed);
  }, []);

  /**
   * Restore adult/parent self as active learner across restarts.
   * Child learners always require a fresh PIN unlock (shared-device safety).
   */
  const hydrateActiveLearner = useCallback(
    async (currentProfile: Profile | null, _kids: Profile[]) => {
      const storedId = await getStoredActiveLearnerId();
      if (!storedId || !currentProfile) {
        setActiveLearner(null);
        return;
      }

      if (storedId === currentProfile.id) {
        setActiveLearner(toFamilyMember(currentProfile));
        return;
      }

      // Stored child id from a previous unlock — clear and require PIN again.
      await clearStoredActiveLearnerId();
      setActiveLearner(null);
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const nextProfile = await fetchProfile(user.id);
    setProfile(nextProfile);
    if (nextProfile?.role === 'parent' && nextProfile.family_code) {
      setFamilyCode(nextProfile.family_code);
    }
  }, [user]);

  const refreshChildren = useCallback(async () => {
    if (!user || profile?.role !== 'parent') {
      setChildProfiles([]);
      return;
    }
    const kids = await fetchChildren(user.id);
    setChildProfiles(kids);
    await hydrateActiveLearner(profile, kids);
  }, [hydrateActiveLearner, profile, user]);

  const refreshGuestProgress = useCallback(async () => {
    if (!guestProfile) {
      setGuestProgress(null);
      setShowMilestonePrompt(false);
      return;
    }
    const progress = await getGuestProgress();
    setGuestProgress(progress);
    await syncGuestMilestone(progress);
  }, [guestProfile, syncGuestMilestone]);

  const hydrateGuestFromStorage = useCallback(async (): Promise<boolean> => {
    const guest = await getActiveGuestProfile();
    if (!guest) {
      return false;
    }
    setGuestProfile(guest);
    setActiveLearner(guestToLearner(guest));
    const progress = await getGuestProgress();
    setGuestProgress(progress);
    await syncGuestMilestone(progress);
    return true;
  }, [syncGuestMilestone]);

  const ensureDeviceRegistered = useCallback(async () => {
    if (!session || !isEmailVerified(user) || profile?.role !== 'parent') {
      return;
    }
    await registerCurrentDevice();
  }, [profile?.role, session, user]);

  const processAuthUrl = useCallback(async (url: string) => {
    const result = await handleAuthRedirectUrl(url);
    if (result.handled && result.kind === 'recovery') {
      setNeedsPasswordReset(true);
    }
    if (result.session) {
      setSession(result.session);
      setUser(result.session.user);
    }
    return result;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const guestRestored = await hydrateGuestFromStorage();
        if (!mounted) {
          return;
        }

        let authLinkHandled = false;
        const initialUrl = await getInitialAuthUrl();
        if (initialUrl && mounted) {
          try {
            const result = await processAuthUrl(initialUrl);
            authLinkHandled = result.handled;
          } catch {
            // Invalid/expired link — continue normal bootstrap.
          }
        }

        if (
          guestRestored &&
          !authLinkHandled &&
          !isAuthCallbackLocation(initialUrl)
        ) {
          // Guest Mode is local. Do not call email session restore to keep it alive.
          return;
        }

        const currentSession = await getSession();
        if (!mounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          if (await isGuestSessionActive()) {
            const transferred = await transferGuestProgressToAccount(currentSession.user.id);
            setGuestProfile(null);
            setGuestProgress(null);
            setShowMilestonePrompt(false);
            if (transferred.guestProfile) {
              await applyGuestIdentityToProfile(currentSession.user.id, {
                countryCode: transferred.guestProfile.countryCode,
                preferredLanguage: transferred.guestProfile.preferredLanguage,
                displayName: transferred.guestProfile.displayName,
              });
            }
          }

          const nextProfile = await fetchProfile(currentSession.user.id);
          if (!mounted) {
            return;
          }
          setProfile(nextProfile);

          if (nextProfile?.role === 'child') {
            setChildProfiles([]);
            setActiveLearner(toChildFamilyLearner(toFamilyMember(nextProfile)));
            if (nextProfile.parent_id) {
              await saveChildFamilySession({
                child: toFamilyMember(nextProfile),
                familyCode: '',
                parentId: nextProfile.parent_id,
                unlockedAt: new Date().toISOString(),
              });
            }
          } else {
            let kids: Profile[] = [];
            if (nextProfile?.role === 'parent') {
              kids = await fetchChildren(currentSession.user.id);
              if (!mounted) {
                return;
              }
              setChildProfiles(kids);
              if (nextProfile.family_code) {
                setFamilyCode(nextProfile.family_code);
              }
            }

            await hydrateActiveLearner(nextProfile, kids);

            if (isEmailVerified(currentSession.user) && nextProfile?.role === 'parent') {
              try {
                await registerCurrentDevice();
              } catch {
                // Device registration can retry after login screens.
              }
            }
          }
        } else {
          // Child family-code sessions never restore across cold starts — PIN again.
          await clearChildFamilySession();
          if (!mounted) {
            return;
          }
          const restored = await hydrateGuestFromStorage();
          if (!restored) {
            setGuestProfile(null);
            setGuestProgress(null);
            setShowMilestonePrompt(false);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Auth bootstrap failed', error);
        }
        if (mounted) {
          await hydrateGuestFromStorage();
        }
      } finally {
        bootstrappedRef.current = true;
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    const unsubscribeProcessing = subscribeAuthCallbackProcessing((busy) => {
      processingCallbackRef.current = busy;
      setIsProcessingAuthCallback(busy);
    });

    const unsubscribeLinks = subscribeToAuthUrls((url) => {
      void processAuthUrl(url).catch(() => undefined);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        const shouldHydrateAccount =
          bootstrappedRef.current &&
          Boolean(nextSession?.user) &&
          (event === 'SIGNED_IN' || event === 'USER_UPDATED');

        if (shouldHydrateAccount) {
          setIsAccountHydrating(true);
        }

        try {
          if (event === 'PASSWORD_RECOVERY') {
            setNeedsPasswordReset(true);
          } else if (
            nextSession?.user &&
            getLastHandledAuthLinkKind() === 'recovery' &&
            (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
          ) {
            setNeedsPasswordReset(true);
          }

          const guestActive = await isGuestSessionActive();
          const callbackBusy =
            processingCallbackRef.current || isAuthCallbackProcessing() || isAuthCallbackLocation();
          if (
            guestActive &&
            !callbackBusy &&
            (event === 'INITIAL_SESSION' ||
              event === 'TOKEN_REFRESHED' ||
              (event === 'USER_UPDATED' && !isAuthCallbackLocation()))
          ) {
            return;
          }

          setSession(nextSession);
          setUser(nextSession?.user ?? null);

          if (!nextSession?.user) {
            if (callbackBusy) {
              return;
            }
            setIsAccountHydrating(false);
            setProfile(null);
            setChildProfiles([]);
            setActiveLearner(null);
            setFamilyCode(null);
            setNeedsPasswordReset(false);
            await clearChildFamilySession();
            await clearStoredActiveLearnerId();

            const restored = await hydrateGuestFromStorage();
            if (!restored) {
              setGuestProfile(null);
              setGuestProgress(null);
              setShowMilestonePrompt(false);
            }
            return;
          }

          // Transfer any local guest trial progress onto the new account.
          const transferred = await transferGuestProgressToAccount(nextSession.user.id);
          setGuestProfile(null);
          setGuestProgress(null);
          setShowMilestonePrompt(false);

          if (transferred.guestProfile) {
            await applyGuestIdentityToProfile(nextSession.user.id, {
              countryCode: transferred.guestProfile.countryCode,
              preferredLanguage: transferred.guestProfile.preferredLanguage,
              displayName: transferred.guestProfile.displayName,
            });
          }

          const nextProfile = await fetchProfile(nextSession.user.id);
          setProfile(nextProfile);

          if (nextProfile?.role === 'child') {
            setChildProfiles([]);
            setActiveLearner(toChildFamilyLearner(toFamilyMember(nextProfile)));
            return;
          }

          let kids: Profile[] = [];
          if (nextProfile?.role === 'parent') {
            kids = await fetchChildren(nextSession.user.id);
            setChildProfiles(kids);
            if (nextProfile.family_code) {
              setFamilyCode(nextProfile.family_code);
            }
          } else {
            setChildProfiles([]);
          }

          await hydrateActiveLearner(nextProfile, kids);

          // Feature 005 then 004 then games: merge staged guest reader prefs, learning, games.
          if (nextProfile && transferred.migrated) {
            const learner = toFamilyMember(nextProfile);
            const { mergeMigratedGuestReaderSettings } = await import('@/features/reader');
            await mergeMigratedGuestReaderSettings(nextSession.user.id, learner);
            const { mergeMigratedGuestProgress } = await import('@/features/learning');
            await mergeMigratedGuestProgress(nextSession.user.id, learner);
            const { mergeMigratedGuestGamesProgress } = await import('@/features/games');
            await mergeMigratedGuestGamesProgress(nextSession.user.id, learner);
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Auth state sync failed', error);
          }
        } finally {
          if (shouldHydrateAccount) {
            setIsAccountHydrating(false);
          }
        }
      },
    );

    return () => {
      mounted = false;
      unsubscribeProcessing();
      unsubscribeLinks();
      authListener.subscription.unsubscribe();
    };
  }, [hydrateActiveLearner, hydrateGuestFromStorage, processAuthUrl]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') {
        return;
      }
      if (sessionRef.current) {
        return;
      }
      void hydrateGuestFromStorage();
    });
    return () => sub.remove();
  }, [hydrateGuestFromStorage]);

  const selectSelfAsLearner = useCallback(async () => {
    if (!profile) {
      throw new Error('No profile loaded');
    }
    await setStoredActiveLearnerId(profile.id);
    setActiveLearner(toFamilyMember(profile));
  }, [profile]);

  const unlockChild = useCallback(
    async (childId: string, pin: string) => {
      await verifyChildPin(childId, pin);
      const child = childProfiles.find((item) => item.id === childId);
      if (!child) {
        throw new Error('Child profile not found');
      }
      await clearChildFamilySession();
      await setStoredActiveLearnerId(child.id);
      setActiveLearner(toFamilyMember(child));
    },
    [childProfiles],
  );

  const unlockChildByFamilyCode = useCallback(
    async (code: string, childId: string, pin: string) => {
      const child = await unlockChildWithFamilyCode({
        familyCode: code,
        childId,
        pin,
      });
      await clearGuestProfile();
      setGuestProfile(null);
      setGuestProgress(null);
      setShowMilestonePrompt(false);
      await saveChildFamilySession({
        child,
        familyCode: code.trim().toUpperCase(),
        parentId: child.parent_id,
        unlockedAt: new Date().toISOString(),
      });
      setFamilyCode(code.trim().toUpperCase());
      await clearStoredActiveLearnerId();
      setActiveLearner(toChildFamilyLearner(child));
    },
    [],
  );

  const clearActiveLearner = useCallback(async () => {
    await clearStoredActiveLearnerId();
    await clearChildFamilySession();
    setActiveLearner(null);
  }, []);

  const endChildFamilySession = useCallback(async () => {
    const childAccount = profile?.role === 'child';
    await clearChildFamilySession();
    await clearStoredActiveLearnerId();
    setActiveLearner(null);
    setFamilyCode(null);
    if (childAccount) {
      setProfile(null);
      await logoutAccount();
    }
  }, [profile?.role]);

  const ensureFamilyCode = useCallback(async () => {
    if (!user || profile?.role !== 'parent') {
      throw new Error('Only parents have a family code');
    }
    const code = await ensureParentFamilyCode();
    setFamilyCode(code);
    return code;
  }, [profile?.role, user]);

  const createChild = useCallback(
    async (input: CreateChildInput) => {
      if (!user || profile?.role !== 'parent') {
        throw new Error('Only parents can create child accounts');
      }
      const created = await createChildProfile(user.id, input);
      await refreshChildren();
      return created;
    },
    [profile?.role, refreshChildren, user],
  );

  const updateChild = useCallback(
    async (childId: string, input: UpdateChildInput) => {
      if (!user || profile?.role !== 'parent') {
        throw new Error('Only parents can update child accounts');
      }
      const updated = await updateChildProfile(childId, input);
      await refreshChildren();
      return updated;
    },
    [profile?.role, refreshChildren, user],
  );

  const deleteChild = useCallback(
    async (childId: string) => {
      if (!user || profile?.role !== 'parent') {
        throw new Error('Only parents can delete child accounts');
      }
      await deleteChildProfile(childId);
      const storedId = await getStoredActiveLearnerId();
      if (storedId === childId) {
        await clearStoredActiveLearnerId();
        setActiveLearner(null);
      }
      await refreshChildren();
    },
    [profile?.role, refreshChildren, user],
  );

  const resetChildPin = useCallback(
    async (childId: string, pin: string) => {
      await setChildPin(childId, pin);
      await refreshChildren();
    },
    [refreshChildren],
  );

  const updateChildComms = useCallback(
    async (childId: string, settings: { chatEnabled: boolean; callsEnabled: boolean }) => {
      if (!user || profile?.role !== 'parent') {
        throw new Error('Only parents can change child communication settings');
      }
      await updateChildCommsSettings(childId, settings);
      await refreshChildren();
    },
    [profile?.role, refreshChildren, user],
  );

  const startGuest = useCallback(
    async (input: GuestOnboardingInput) => {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Guest Mode is local; leftover email tokens must not block it.
      }
      setSession(null);
      setUser(null);
      const existing = await getGuestProfile();
      const nextGuest = await saveGuestProfile({
        displayName: input.displayName,
        ageGroup: input.ageGroup,
        countryCode: input.countryCode,
        preferredLanguage: input.preferredLanguage,
        id: existing?.id,
        createdAt: existing?.createdAt,
      });
      setGuestProfile(nextGuest);
      setActiveLearner(guestToLearner(nextGuest));
      const progress = await getGuestProgress();
      setGuestProgress(progress);
      await syncGuestMilestone(progress);
    },
    [syncGuestMilestone],
  );

  const endGuestSession = useCallback(async () => {
    await clearGuestProfile();
    setGuestProfile(null);
    setGuestProgress(null);
    setActiveLearner(null);
    setShowMilestonePrompt(false);
  }, []);

  const simulateGuestProgress = useCallback(
    async (delta = 1) => {
      if (!guestProfile) {
        return;
      }
      const progress = await addGuestSurahProgress(delta);
      setGuestProgress(progress);
      await syncGuestMilestone(progress);
    },
    [guestProfile, syncGuestMilestone],
  );

  const dismissGuestMilestone = useCallback(async () => {
    await dismissMilestonePrompt();
    setShowMilestonePrompt(false);
  }, []);

  const migrateGuestProgressAfterRegister = useCallback(async () => {
    if (!user) {
      return;
    }
    const transferred = await transferGuestProgressToAccount(user.id);
    setGuestProfile(null);
    setGuestProgress(null);
    setShowMilestonePrompt(false);

    if (transferred.guestProfile) {
      const updated = await applyGuestIdentityToProfile(user.id, {
        countryCode: transferred.guestProfile.countryCode,
        preferredLanguage: transferred.guestProfile.preferredLanguage,
        displayName: transferred.guestProfile.displayName,
      });
      if (updated) {
        setProfile(updated);
      }
    }

    const nextProfile = (await fetchProfile(user.id)) ?? profile;
    if (nextProfile) {
      setProfile(nextProfile);
      const learner = toFamilyMember(nextProfile);
      const { mergeMigratedGuestReaderSettings } = await import('@/features/reader');
      await mergeMigratedGuestReaderSettings(user.id, learner);
      const { mergeMigratedGuestProgress } = await import('@/features/learning');
      await mergeMigratedGuestProgress(user.id, learner);
      const { mergeMigratedGuestGamesProgress } = await import('@/features/games');
      await mergeMigratedGuestGamesProgress(user.id, learner);
    }
  }, [profile, user]);

  const clearPasswordResetFlag = useCallback(() => {
    setNeedsPasswordReset(false);
  }, []);

  const setPreferredLanguage = useCallback(
    async (languageCode: string) => {
      const next = languageCode.trim().toLowerCase();
      if (!next) {
        return;
      }

      if (guestProfile) {
        const updated = await updateGuestPreferredLanguage(next);
        if (updated) {
          setGuestProfile(updated);
          setActiveLearner(guestToLearner(updated));
        }
        return;
      }

      if (isChildFamilyLearner(activeLearner)) {
        const stored = await loadChildFamilySession();
        if (stored) {
          const child = { ...stored.child, preferred_language: next };
          await saveChildFamilySession({ ...stored, child });
          setActiveLearner(toChildFamilyLearner(child));
        } else {
          setActiveLearner({ ...activeLearner, preferred_language: next });
        }
        try {
          await updateProfilePreferredLanguage(activeLearner.id, next);
        } catch {
          // Child RLS may block self-update; the existing family session still keeps the choice.
        }
        return;
      }

      if (
        profile?.role === 'parent' &&
        activeLearner?.role === 'child' &&
        activeLearner.id !== profile.id
      ) {
        await updateProfilePreferredLanguage(activeLearner.id, next);
        setActiveLearner({ ...activeLearner, preferred_language: next });
        await refreshChildren();
        return;
      }

      if (profile && (profile.role === 'adult' || profile.role === 'parent')) {
        await updateProfilePreferredLanguage(profile.id, next);
        const refreshed = await fetchProfile(profile.id);
        if (refreshed) {
          setProfile(refreshed);
          if (!activeLearner || activeLearner.id === refreshed.id) {
            setActiveLearner(toFamilyMember(refreshed));
          }
        }
      }
    },
    [activeLearner, guestProfile, profile, refreshChildren],
  );

  const signOut = useCallback(async () => {
    await clearStoredActiveLearnerId();
    await clearChildFamilySession();
    setActiveLearner(null);
    setProfile(null);
    setChildProfiles([]);
    setFamilyCode(null);
    setNeedsPasswordReset(false);
    await logoutAccount();

    const restored = await hydrateGuestFromStorage();
    if (!restored) {
      setGuestProfile(null);
      setGuestProgress(null);
      setShowMilestonePrompt(false);
    }
  }, [hydrateGuestFromStorage]);

  const isGuest = Boolean(guestProfile) && !session;
  const isChildFamilySession =
    isChildFamilyLearner(activeLearner) || profile?.role === 'child';
  const isGuestAtLimit = Boolean(guestProgress && hasReachedGuestLimit(guestProgress));
  const familyManageAllowed = canManageFamily({
    profileRole: profile?.role,
    activeLearner,
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      isAccountHydrating,
      isProcessingAuthCallback,
      session,
      user,
      profile,
      children: childProfiles,
      activeLearner,
      isEmailVerified: isEmailVerified(user),
      isGuest,
      isChildFamilySession,
      guestProfile,
      guestProgress,
      showMilestonePrompt: isGuest && showMilestonePrompt,
      isGuestAtLimit: isGuest && isGuestAtLimit,
      needsPasswordReset,
      canManageFamily: familyManageAllowed,
      familyCode,
      refreshProfile,
      refreshChildren,
      selectSelfAsLearner,
      unlockChild,
      unlockChildByFamilyCode,
      clearActiveLearner,
      createChild,
      updateChild,
      deleteChild,
      resetChildPin,
      updateChildComms,
      ensureFamilyCode,
      signOut,
      ensureDeviceRegistered,
      startGuest,
      endGuestSession,
      endChildFamilySession,
      refreshGuestProgress,
      simulateGuestProgress,
      dismissGuestMilestone,
      migrateGuestProgressAfterRegister,
      clearPasswordResetFlag,
      setPreferredLanguage,
    }),
    [
      activeLearner,
      childProfiles,
      clearActiveLearner,
      clearPasswordResetFlag,
      createChild,
      deleteChild,
      dismissGuestMilestone,
      endChildFamilySession,
      endGuestSession,
      ensureDeviceRegistered,
      ensureFamilyCode,
      familyCode,
      familyManageAllowed,
      guestProfile,
      guestProgress,
      isAccountHydrating,
      isBootstrapping,
      isChildFamilySession,
      isGuest,
      isGuestAtLimit,
      isProcessingAuthCallback,
      migrateGuestProgressAfterRegister,
      needsPasswordReset,
      profile,
      refreshChildren,
      refreshGuestProgress,
      refreshProfile,
      resetChildPin,
      selectSelfAsLearner,
      session,
      setPreferredLanguage,
      showMilestonePrompt,
      signOut,
      simulateGuestProgress,
      startGuest,
      unlockChild,
      unlockChildByFamilyCode,
      updateChild,
      updateChildComms,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{reactChildren}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  return context;
}
