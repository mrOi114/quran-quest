import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';

import { useAuth } from '@/features/auth';

type NavItem = {
  label: string;
  icon: string;
  href: string;
  matches: (pathname: string) => boolean;
};

type WebAppShellProps = {
  children: ReactNode;
};

const mainNavItems: NavItem[] = [
  { label: 'Home', icon: '🏠', href: '/(app)/home', matches: (pathname) => pathname === '/home' || pathname === '/' },
  {
    label: 'Learn / Quran',
    icon: '📖',
    href: '/(app)/reader',
    matches: (pathname) => pathname.startsWith('/reader'),
  },
  {
    label: 'Lesson',
    icon: '🧠',
    href: '/(app)/lesson',
    matches: (pathname) => pathname.startsWith('/lesson'),
  },
  { label: 'Revision', icon: '🔄', href: '/(app)/revision', matches: (pathname) => pathname.startsWith('/revision') },
  { label: 'Games', icon: '🎮', href: '/(app)/games', matches: (pathname) => pathname.startsWith('/games') || pathname.startsWith('/companion') },
  { label: 'Companion', icon: '🤖', href: '/(app)/companion', matches: (pathname) => pathname.startsWith('/companion') },
  {
    label: 'Leaderboard',
    icon: '🏆',
    href: '/(app)/leaderboard',
    matches: (pathname) =>
      pathname.startsWith('/leaderboard') || pathname.startsWith('/progress'),
  },
  { label: 'Circle', icon: '👥', href: '/(app)/gates/circle', matches: (pathname) => pathname.startsWith('/gates/circle') },
  { label: 'Family', icon: '👪', href: '/(app)/family', matches: (pathname) => pathname.startsWith('/family') || pathname.startsWith('/parent/children') || pathname.startsWith('/child-pin') },
  { label: 'Profile', icon: '👤', href: '/(app)/profile', matches: (pathname) => pathname.startsWith('/profile') },
  { label: 'Settings', icon: '⚙️', href: '/(app)/settings', matches: (pathname) => pathname.startsWith('/settings') },
];

const quickNavLabels = ['Home', 'Learn / Quran', 'Lesson', 'Leaderboard', 'Circle'] as const;

const quickNavItems = quickNavLabels
  .map((label) => mainNavItems.find((item) => item.label === label))
  .filter((item): item is NavItem => Boolean(item));

function isActiveNavItem(item: NavItem, pathname: string): boolean {
  return item.matches(pathname);
}

function NavButton({
  item,
  active,
  onPress,
}: {
  item: NavItem;
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
        {item.label}
      </Text>
    </Pressable>
  );
}

function QuickNavButton({
  item,
  active,
  onPress,
}: {
  item: NavItem;
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
        {item.label}
      </Text>
    </Pressable>
  );
}

export function WebAppShell({ children }: WebAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { activeLearner, profile, isGuest, signOut, endGuestSession } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDesktop = width >= 1024;

  const learnerLabel = useMemo(() => {
    if (activeLearner?.display_name) {
      return activeLearner.display_name;
    }
    if (profile?.display_name) {
      return profile.display_name;
    }
    return isGuest ? 'Guest learner' : 'QuranFamily';
  }, [activeLearner?.display_name, isGuest, profile?.display_name]);

  const currentSectionLabel = useMemo(() => {
    const activeItem = mainNavItems.find((item) => isActiveNavItem(item, pathname));
    return activeItem?.label ?? 'QuranFamily';
  }, [pathname]);

  function navigate(href: string) {
    setDrawerOpen(false);
    router.push(href as never);
  }

  function handleSignOut() {
    setDrawerOpen(false);
    void (isGuest ? endGuestSession() : signOut()).then(() => router.replace('/(auth)/welcome'));
  }

  const navigationList = (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
        Navigation
      </Text>
      {mainNavItems.map((item) => (
        <NavButton
          key={item.href}
          item={item}
          active={isActiveNavItem(item, pathname)}
          onPress={() => navigate(item.href)}
        />
      ))}

      <View className="mt-4 rounded-2xl bg-white/10 px-4 py-4">
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
          Learner
        </Text>
        <Text className="mt-2 text-base font-semibold text-white">{learnerLabel}</Text>
        <Text className="mt-1 text-sm text-brand-100">Current section: {currentSectionLabel}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          className="mt-4 min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3"
        >
          <Text className="text-sm font-semibold text-white">
            {isGuest ? 'End guest trial' : 'Sign out'}
          </Text>
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
                {learnerLabel} · {currentSectionLabel}
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
                accessibilityLabel="Open navigation menu"
                onPress={() => setDrawerOpen(true)}
                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Text className="text-base font-semibold text-white">Menu</Text>
              </Pressable>
              <View className="flex-1 items-center px-2">
                <Text className="text-lg font-bold text-white">QuranFamily</Text>
                <Text className="text-xs text-brand-100" numberOfLines={1}>
                  {learnerLabel} · {currentSectionLabel}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to profile"
                onPress={() => navigate('/(app)/profile')}
                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <Text className="text-base font-semibold text-white">Profile</Text>
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