import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import type { GuestOnboardingInput } from '../schemas';
import {
  addGuestSurahProgress,
  clearGuestProfile,
  clearStoredActiveLearnerId,
  createChildProfile,
  dismissMilestonePrompt,
  fetchChildren,
  fetchProfile,
  getGuestProfile,
  getGuestProgress,
  getSession,
  getStoredActiveLearnerId,
  hasReachedGuestLimit,
  hasReachedGuestMilestone,
  isEmailVerified,
  isMilestoneDismissed,
  logoutAccount,
  registerCurrentDevice,
  saveGuestProfile,
  setChildPin,
  setStoredActiveLearnerId,
  transferGuestProgressToAccount,
  verifyChildPin,
  type GuestProfile,
  type GuestProgress,
} from '../services';
import type {
  ActiveLearner,
  CreateChildInput,
  FamilyMember,
  GuestLearner,
} from '../types';

type AuthContextValue = {
  isBootstrapping: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  children: Profile[];
  activeLearner: ActiveLearner | null;
  isEmailVerified: boolean;
  isGuest: boolean;
  guestProfile: GuestProfile | null;
  guestProgress: GuestProgress | null;
  showMilestonePrompt: boolean;
  isGuestAtLimit: boolean;
  refreshProfile: () => Promise<void>;
  refreshChildren: () => Promise<void>;
  selectSelfAsLearner: () => Promise<void>;
  unlockChild: (childId: string, pin: string) => Promise<void>;
  clearActiveLearner: () => Promise<void>;
  createChild: (input: CreateChildInput) => Promise<Profile>;
  resetChildPin: (childId: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
  ensureDeviceRegistered: () => Promise<void>;
  startGuest: (input: GuestOnboardingInput) => Promise<void>;
  endGuestSession: () => Promise<void>;
  refreshGuestProgress: () => Promise<void>;
  simulateGuestProgress: (delta?: number) => Promise<void>;
  dismissGuestMilestone: () => Promise<void>;
  migrateGuestProgressAfterRegister: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [childProfiles, setChildProfiles] = useState<Profile[]>([]);
  const [activeLearner, setActiveLearner] = useState<ActiveLearner | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [guestProgress, setGuestProgress] = useState<GuestProgress | null>(null);
  const [showMilestonePrompt, setShowMilestonePrompt] = useState(false);

  const syncGuestMilestone = useCallback(async (progress: GuestProgress | null) => {
    if (!progress) {
      setShowMilestonePrompt(false);
      return;
    }
    const dismissed = await isMilestoneDismissed();
    setShowMilestonePrompt(hasReachedGuestMilestone(progress) && !dismissed);
  }, []);

  const hydrateActiveLearner = useCallback(
    async (currentProfile: Profile | null, kids: Profile[]) => {
      const storedId = await getStoredActiveLearnerId();
      if (!storedId || !currentProfile) {
        setActiveLearner(null);
        return;
      }

      if (storedId === currentProfile.id) {
        setActiveLearner(toFamilyMember(currentProfile));
        return;
      }

      const child = kids.find((item) => item.id === storedId);
      if (child) {
        setActiveLearner(toFamilyMember(child));
        return;
      }

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

  const ensureDeviceRegistered = useCallback(async () => {
    if (!session || !isEmailVerified(user)) {
      return;
    }
    await registerCurrentDevice();
  }, [session, user]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const currentSession = await getSession();
        if (!mounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const nextProfile = await fetchProfile(currentSession.user.id);
          if (!mounted) {
            return;
          }
          setProfile(nextProfile);

          let kids: Profile[] = [];
          if (nextProfile?.role === 'parent') {
            kids = await fetchChildren(currentSession.user.id);
            if (!mounted) {
              return;
            }
            setChildProfiles(kids);
          }

          await hydrateActiveLearner(nextProfile, kids);

          if (isEmailVerified(currentSession.user)) {
            try {
              await registerCurrentDevice();
            } catch {
              // Device registration can retry after login screens.
            }
          }
        } else {
          const guest = await getGuestProfile();
          if (!mounted) {
            return;
          }
          if (guest) {
            setGuestProfile(guest);
            setActiveLearner(guestToLearner(guest));
            const progress = await getGuestProgress();
            if (!mounted) {
              return;
            }
            setGuestProgress(progress);
            await syncGuestMilestone(progress);
          }
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (!nextSession?.user) {
          setProfile(null);
          setChildProfiles([]);
          setActiveLearner(null);
          await clearStoredActiveLearnerId();

          const guest = await getGuestProfile();
          setGuestProfile(guest);
          if (guest) {
            setActiveLearner(guestToLearner(guest));
            const progress = await getGuestProgress();
            setGuestProgress(progress);
            await syncGuestMilestone(progress);
          } else {
            setGuestProgress(null);
            setShowMilestonePrompt(false);
          }
          return;
        }

        // Transfer any local guest trial progress onto the new account.
        await transferGuestProgressToAccount(nextSession.user.id);
        setGuestProfile(null);
        setGuestProgress(null);
        setShowMilestonePrompt(false);

        const nextProfile = await fetchProfile(nextSession.user.id);
        setProfile(nextProfile);

        let kids: Profile[] = [];
        if (nextProfile?.role === 'parent') {
          kids = await fetchChildren(nextSession.user.id);
          setChildProfiles(kids);
        } else {
          setChildProfiles([]);
        }

        await hydrateActiveLearner(nextProfile, kids);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [hydrateActiveLearner, syncGuestMilestone]);

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
      await setStoredActiveLearnerId(child.id);
      setActiveLearner(toFamilyMember(child));
    },
    [childProfiles],
  );

  const clearActiveLearner = useCallback(async () => {
    await clearStoredActiveLearnerId();
    setActiveLearner(null);
  }, []);

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

  const resetChildPin = useCallback(
    async (childId: string, pin: string) => {
      await setChildPin(childId, pin);
      await refreshChildren();
    },
    [refreshChildren],
  );

  const startGuest = useCallback(
    async (input: GuestOnboardingInput) => {
      const nextGuest = await saveGuestProfile({
        displayName: input.displayName,
        ageGroup: input.ageGroup,
        countryCode: input.countryCode,
        preferredLanguage: input.preferredLanguage,
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
    await transferGuestProgressToAccount(user.id);
    setGuestProfile(null);
    setGuestProgress(null);
    setShowMilestonePrompt(false);
  }, [user]);

  const signOut = useCallback(async () => {
    await clearStoredActiveLearnerId();
    setActiveLearner(null);
    setProfile(null);
    setChildProfiles([]);
    await logoutAccount();

    const guest = await getGuestProfile();
    setGuestProfile(guest);
    if (guest) {
      setActiveLearner(guestToLearner(guest));
      const progress = await getGuestProgress();
      setGuestProgress(progress);
      await syncGuestMilestone(progress);
    }
  }, [syncGuestMilestone]);

  const isGuest = Boolean(guestProfile) && !session;
  const isGuestAtLimit = Boolean(guestProgress && hasReachedGuestLimit(guestProgress));

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      session,
      user,
      profile,
      children: childProfiles,
      activeLearner,
      isEmailVerified: isEmailVerified(user),
      isGuest,
      guestProfile,
      guestProgress,
      showMilestonePrompt: isGuest && showMilestonePrompt,
      isGuestAtLimit: isGuest && isGuestAtLimit,
      refreshProfile,
      refreshChildren,
      selectSelfAsLearner,
      unlockChild,
      clearActiveLearner,
      createChild,
      resetChildPin,
      signOut,
      ensureDeviceRegistered,
      startGuest,
      endGuestSession,
      refreshGuestProgress,
      simulateGuestProgress,
      dismissGuestMilestone,
      migrateGuestProgressAfterRegister,
    }),
    [
      activeLearner,
      childProfiles,
      clearActiveLearner,
      createChild,
      dismissGuestMilestone,
      endGuestSession,
      ensureDeviceRegistered,
      guestProfile,
      guestProgress,
      isBootstrapping,
      isGuest,
      isGuestAtLimit,
      migrateGuestProgressAfterRegister,
      profile,
      refreshChildren,
      refreshGuestProgress,
      refreshProfile,
      resetChildPin,
      selectSelfAsLearner,
      session,
      showMilestonePrompt,
      signOut,
      simulateGuestProgress,
      startGuest,
      unlockChild,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{reactChildren}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
