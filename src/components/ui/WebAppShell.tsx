import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';

import { useAuth } from '@/features/auth';
import { useI18n, type MessageKey } from '@/i18n';

type NavId =
  | 'home'
  | 'learn'
  | 'lesson'
  | 'revision'
  | 'games'
  | 'companion'
  | 'leaderboard'
  | 'circle'
  | 'competition'
  | 'chat'
  | 'family'
  | 'profile'
  | 'settings'
  | 'myFamily'
  | 'learning'
  | 'achievements'
  | 'progress';

type NavItem = {
  id: NavId;
  icon: string;
  href: string;
  matches: (pathname: string) => boolean;
};

type WebAppShellProps = {
  children: ReactNode;
};

const NAV_LABEL_KEY: Record<NavId, MessageKey> = {
  home: 'nav.home',
  learn: 'nav.learn',
  lesson: 'nav.lesson',
  revision: 'nav.revision',
  games: 'nav.games',
  companion: 'nav.companion',
  leaderboard: 'nav.leaderboard',
  circle: 'nav.circle',
  competition: 'nav.competition',
  chat: 'nav.chat',
  family: 'nav.family',
  profile: 'nav.profile',
  settings: 'nav.settings',
  myFamily: 'nav.myFamily',
  learning: 'nav.learning',
  achievements: 'nav.achievements',
  progress: 'nav.progress',
};

const learnerNavItems: NavItem[] = [
  { id: 'home', icon: '🏠', href: '/(app)/home', matches: (pathname) => pathname === '/home' || pathname === '/' },
  {
    id: 'learn',
    icon: '📖',
    href: '/(app)/reader',
    matches: (pathname) => pathname.startsWith('/reader'),
  },
  {
    id: 'lesson',
    icon: '🧠',
    href: '/(app)/lesson',
    matches: (pathname) => pathname.startsWith('/lesson'),
  },
  {
    id: 'competition',
    icon: '🌙',
    href: '/(app)/competition',
    matches: (pathname) => pathname.startsWith('/competition') || pathname.startsWith('/challenge'),
  },
  {
    id: 'leaderboard',
    icon: '🏆',
    href: '/(app)/leaderboard',
    matches: (pathname) =>
      pathname.startsWith('/leaderboard') || pathname.startsWith('/progress'),
  },
  { id: 'revision', icon: '🔄', href: '/(app)/revision', matches: (pathname) => pathname.startsWith('/revision') },
  { id: 'games', icon: '🎮', href: '/(app)/games', matches: (pathname) => pathname.startsWith('/games') || pathname.startsWith('/companion') || pathname.startsWith('/qisas') },
  { id: 'companion', icon: '🤖', href: '/(app)/companion', matches: (pathname) => pathname.startsWith('/companion') },
  { id: 'circle', icon: '🔵', href: '/(app)/circle', matches: (pathname) => pathname.startsWith('/circle') },
  {
    id: 'chat',
    icon: '💬',
    href: '/(app)/family/chat',
    matches: (pathname) => pathname.startsWith('/family/chat') || pathname.startsWith('/family/call'),
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧',
    href: '/(app)/family',
    matches: (pathname) =>
      (pathname.startsWith('/family') &&
        !pathname.startsWith('/family/chat') &&
        !pathname.startsWith('/family/call')) ||
      pathname.startsWith('/parent/') ||
      pathname.startsWith('/child-pin'),
  },
  { id: 'profile', icon: '👤', href: '/(app)/profile', matches: (pathname) => pathname.startsWith('/profile') },
  { id: 'settings', icon: '⚙️', href: '/(app)/settings', matches: (pathname) => pathname.startsWith('/settings') },
];

const parentNavItems: NavItem[] = [
  { id: 'home', icon: '🏠', href: '/(app)/home', matches: (pathname) => pathname === '/home' || pathname === '/' },
  {
    id: 'myFamily',
    icon: '👨‍👩‍👧',
    href: '/(app)/family',
    matches: (pathname) =>
      pathname.startsWith('/parent/') ||
      (pathname.startsWith('/family') &&
        !pathname.startsWith('/family/chat') &&
        !pathname.startsWith('/family/call')) ||
      pathname.startsWith('/child-pin'),
  },
  {
    id: 'circle',
    icon: '🔵',
    href: '/(app)/circle',
    matches: (pathname) => pathname.startsWith('/circle'),
  },
  {
    id: 'competition',
    icon: '🌙',
    href: '/(app)/competition',
    matches: (pathname) => pathname.startsWith('/competition') || pathname.startsWith('/challenge'),
  },
  {
    id: 'chat',
    icon: '💬',
    href: '/(app)/family/chat',
    matches: (pathname) => pathname.startsWith('/family/chat') || pathname.startsWith('/family/call'),
  },
  {
    id: 'learning',
    icon: '📖',
    href: '/(app)/reader',
    matches: (pathname) => pathname.startsWith('/reader') || pathname.startsWith('/lesson'),
  },
  { id: 'revision', icon: '🔄', href: '/(app)/revision', matches: (pathname) => pathname.startsWith('/revision') },
  {
    id: 'achievements',
    icon: '🏆',
    href: '/(app)/leaderboard',
    matches: (pathname) => pathname.startsWith('/leaderboard'),
  },
  { id: 'progress', icon: '📊', href: '/(app)/progress', matches: (pathname) => pathname.startsWith('/progress') },
  { id: 'settings', icon: '⚙️', href: '/(app)/settings', matches: (pathname) => pathname.startsWith('/settings') },
];

const learnerQuickIds: NavId[] = ['home', 'learn', 'lesson', 'competition', 'leaderboard'];
const parentQuickIds: NavId[] = ['home', 'myFamily', 'circle', 'competition', 'settings'];
const childFamilyQuickIds: NavId[] = ['home', 'learn', 'lesson', 'competition', 'leaderboard'];

function isActiveNavItem(item: NavItem, pathname: string): boolean {
  return item.matches(pathname);
}

function NavButton({
  item,
  label,
  active,
  onPress,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`mb-2 min-h-12 flex-row items-center rounded-2xl px-4 py-3 active:opacity-90 ${
        active ? 'bg-brand-50' : 'bg-transparent'
      }`}
    >
      <Text className={`mr-3 text-lg ${active ? 'text-brand-700' : 'text-brand-100'}`}>
        {item.icon}
      </Text>
      <Text className={`text-base font-semibold ${active ? 'text-brand-800' : 'text-white'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function QuickNavButton({
  item,
  label,
  active,
  onPress,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`flex-1 items-center justify-center px-2 py-2 ${active ? 'bg-brand-50' : 'bg-transparent'}`}
    >
      <Text className={`text-lg ${active ? 'text-brand-700' : 'text-white'}`}>{item.icon}</Text>
      <Text
        className={`mt-1 text-[10px] font-semibold ${active ? 'text-brand-800' : 'text-brand-100'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function WebAppShell({ children }: WebAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const {
    activeLearner,
    profile,
    isGuest,
    isChildFamilySession,
    canManageFamily,
    signOut,
    endGuestSession,
    endChildFamilySession,
  } = useAuth();
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDesktop = width >= 1024;
  const useParentMenu = canManageFamily && !isChildFamilySession;

  const isChildLearning =
    isChildFamilySession || activeLearner?.role === 'child' || profile?.role === 'child';

  const mainNavItems = useMemo(() => {
    const hideCircle = (items: NavItem[]) =>
      isGuest ? items.filter((item) => item.id !== 'circle') : items;
    if (useParentMenu) {
      return hideCircle(parentNavItems);
    }
    if (isChildLearning) {
      return hideCircle(learnerNavItems.filter((item) => item.id !== 'family'));
    }
    return hideCircle(learnerNavItems.filter((item) => item.id !== 'chat'));
  }, [isChildLearning, isGuest, useParentMenu]);

  const quickNavItems = useMemo(() => {
    const ids = useParentMenu
      ? parentQuickIds
      : isChildLearning
        ? childFamilyQuickIds
        : isGuest
          ? (['home', 'learn', 'lesson', 'competition', 'leaderboard'] as NavId[])
          : learnerQuickIds;
    return ids
      .map((id) => mainNavItems.find((item) => item.id === id))
      .filter((item): item is NavItem => Boolean(item));
  }, [isChildLearning, isGuest, mainNavItems, useParentMenu]);

  const learnerLabel =
    activeLearner?.display_name ||
    profile?.display_name ||
    (isGuest ? t('nav.guestLearner') : 'QuranFamily');

  const currentSectionLabel = useMemo(() => {
    const activeItem = mainNavItems.find((item) => isActiveNavItem(item, pathname));
    return activeItem ? t(NAV_LABEL_KEY[activeItem.id]) : 'QuranFamily';
  }, [mainNavItems, pathname, t]);

  function navigate(href: string) {
    setDrawerOpen(false);
    router.push(href as never);
  }

  function handleSignOut() {
    setDrawerOpen(false);
    const leave =
      isChildFamilySession
        ? endChildFamilySession()
        : isGuest
          ? endGuestSession()
          : signOut();
    void leave.then(() => router.replace('/(auth)/welcome'));
  }

  const signOutLabel = isChildFamilySession
    ? t('common.switchLearner')
    : isGuest
      ? t('common.endGuestTrial')
      : t('common.logOut');

  const navigationList = (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
        {t('nav.navigation')}
      </Text>
      {mainNavItems.map((item) => (
        <NavButton
          key={item.href}
          item={item}
          label={t(NAV_LABEL_KEY[item.id])}
          active={isActiveNavItem(item, pathname)}
          onPress={() => navigate(item.href)}
        />
      ))}

      <View className="mt-4 rounded-2xl bg-white/10 px-4 py-4">
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
          {t('nav.learner')}
        </Text>
        <Text className="mt-2 text-base font-semibold text-white">{learnerLabel}</Text>
        {isGuest ? (
          <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            {t('common.guestMode')}
          </Text>
        ) : null}
        <Text className="mt-1 text-sm text-brand-100">
          {t('nav.currentSection', { section: currentSectionLabel })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={signOutLabel}
          onPress={handleSignOut}
          className="mt-4 min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3"
        >
          <Text className="text-sm font-semibold text-white">🚪 {signOutLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 flex-row bg-brand-600">
      {isDesktop ? (
        <View className="w-80 border-r border-white/10 bg-brand-900/90">
          <SafeAreaView className="flex-1">
            <View className="px-6 pt-6">
              <Text className="text-3xl font-bold text-white">QuranFamily</Text>
              <Text className="mt-2 text-sm text-brand-100">
                {isGuest
                  ? `${t('common.guestMode')} · ${learnerLabel} · ${currentSectionLabel}`
                  : `${learnerLabel} · ${currentSectionLabel}`}
              </Text>
            </View>
            {navigationList}
          </SafeAreaView>
        </View>
      ) : null}

      <View className="flex-1 min-w-0 bg-brand-600">
        {!isDesktop ? (
          <SafeAreaView edges={["top"]} className="border-b border-white/10 bg-brand-900/85 px-4 py-3">
            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('nav.openMenu')}
                onPress={() => setDrawerOpen(true)}
                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Text className="text-base font-semibold text-white">{t('nav.menu')}</Text>
              </Pressable>
              <View className="flex-1 items-center px-2">
                <Text className="text-lg font-bold text-white">QuranFamily</Text>
                <Text className="text-xs text-brand-100" numberOfLines={1}>
                  {isGuest
                    ? `${t('common.guestMode')} · ${learnerLabel}`
                    : `${learnerLabel} · ${currentSectionLabel}`}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('nav.goToProfile')}
                onPress={() => navigate('/(app)/profile')}
                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Text className="text-base font-semibold text-white">{t('nav.profile')}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        ) : null}

        <View className="flex-1 min-w-0">{children}</View>

        {!isDesktop ? (
          <SafeAreaView edges={["bottom"]} className="border-t border-white/10 bg-brand-900/95">
            <View className="flex-row">
              {quickNavItems.map((item) => (
                <QuickNavButton
                  key={item.href}
                  item={item}
                  label={t(NAV_LABEL_KEY[item.id])}
                  active={isActiveNavItem(item, pathname)}
                  onPress={() => navigate(item.href)}
                />
              ))}
            </View>
          </SafeAreaView>
        ) : null}
      </View>

      <Modal animationType="fade" transparent visible={!isDesktop && drawerOpen} onRequestClose={() => setDrawerOpen(false)}>
        <View className="flex-1 bg-black/40">
          <Pressable className="flex-1" onPress={() => setDrawerOpen(false)} />
          <SafeAreaView className="absolute bottom-0 top-0 w-80 max-w-[88%] bg-brand-900 shadow-2xl">
            <View className="flex-1">
              <View className="border-b border-white/10 px-5 py-5">
                <Text className="text-2xl font-bold text-white">QuranFamily</Text>
                <Text className="mt-2 text-sm text-brand-100">{learnerLabel}</Text>
              </View>
              {navigationList}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
