import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';
import { useUserStats } from '../../services/api/hooks/useStats';
import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { getLocale, t } from '../../utils/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, isLoggedIn, user, updateUser, language, setLanguage, notificationsEnabled, toggleNotifications } = useAuthStore();
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
  
  // 获取最新的统计数据
  const { data: cloudStats } = useUserStats(user?.id);
  
  // 使用 ref 来避免无限循环
  const hasUpdated = useRef(false);
  
  // 同步统计数据到 authStore（只在数据变化时更新一次）
  useEffect(() => {
    if (user && cloudStats && !hasUpdated.current) {
      const needsUpdate = 
        user.totalPoints !== cloudStats.totalPoints ||
        user.availablePoints !== cloudStats.availablePoints ||
        user.level !== cloudStats.level;
      
      if (needsUpdate) {
        updateUser({
          totalPoints: cloudStats.totalPoints,
          availablePoints: cloudStats.availablePoints,
          level: cloudStats.level,
        });
        hasUpdated.current = true;
      }
    }
  }, [cloudStats]);
  
  // 重置标记（当用户或统计数据变化时）
  useEffect(() => {
    hasUpdated.current = false;
  }, [user?.id, cloudStats?.totalPoints, cloudStats?.availablePoints]);
  
  const totalPoints = user?.totalPoints || 0;
  
  const logout = () => {
    useAuthStore.getState().clearAuth();
    router.replace('/auth/login');
  };

  const todayLabel = new Date().toLocaleDateString(getLocale(language), {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const level = Math.max(1, Math.floor(totalPoints / 50) + 1);
  const levelLabel =
    level <= 1
      ? t(language, 'profile.levelBeginner')
      : level <= 3
        ? t(language, 'profile.levelIntermediate')
        : level <= 6
          ? t(language, 'profile.levelSkilled')
          : t(language, 'profile.levelMaster');

  const menuItems = [
    { icon: 'gift', label: t(language, 'profile.rewards'), route: '/rewards' },
    { icon: 'color-palette', label: t(language, 'profile.theme'), route: '/profile/theme' },
    {
      icon: 'globe',
      label: t(language, 'profile.language'),
      onPress: () => setShowLanguageSheet(true),
      value: language === 'zh' ? t(language, 'profile.languageZh') : t(language, 'profile.languageEn'),
    },
    { icon: 'book', label: t(language, 'profile.about'), route: '/profile/about-fogg' },
    { icon: 'chatbubble', label: t(language, 'profile.feedback'), route: '/profile/feedback' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="pt-2 pb-4">
          <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
            {todayLabel}
          </Text>
          <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
            {t(language, 'profile.title')}
          </Text>

          <View className="mt-4">
            <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] p-5">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => isLoggedIn && router.push('/profile/user-info')}
                  activeOpacity={isLoggedIn ? 0.85 : 1}
                  className="flex-row items-center gap-3"
                >
                  <View className="w-14 h-14 rounded-[18px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center overflow-hidden">
                    {user?.avatarUrl ? (
                      <Image source={{ uri: user.avatarUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-2xl">👤</Text>
                    )}
                  </View>
                  <View>
                    {isLoggedIn ? (
                      <>
                        <Text className="text-[18px] font-extrabold text-appText dark:text-appDarkText">
                          {user?.username || t(language, 'profile.defaultUser')}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                            <Text className="text-appText dark:text-appDarkText text-[11px] font-bold">
                              Lv.{level}
                            </Text>
                          </View>
                          <Text className="text-appMuted dark:text-appDarkMuted text-[12px] font-extrabold">
                            {levelLabel}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text className="text-[18px] font-extrabold text-appText dark:text-appDarkText">
                          {t(language, 'profile.notLoggedIn')}
                        </Text>
                        <TouchableOpacity
                          onPress={() => router.push('/auth/login')}
                          activeOpacity={0.9}
                          className="mt-2 px-3 py-1.5 rounded-full bg-appText dark:bg-appDarkText self-start"
                        >
                          <Text className="text-white dark:text-appText text-[12px] font-extrabold">
                            {t(language, 'auth.loginNow')}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder overflow-hidden">
          {menuItems.map((item, index) => {
            const enabled = Boolean(item.route || item.onPress);
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  if (!enabled) return;
                  if (item.onPress) {
                    item.onPress();
                    return;
                  }
                  if (item.route) {
                    router.push(item.route as any);
                  }
                }}
                activeOpacity={enabled ? 0.85 : 1}
                className={`px-4 py-4 flex-row items-center justify-between ${
                  index < menuItems.length - 1 ? 'border-b border-appBorder dark:border-appDarkBorder' : ''
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-2xl bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                    <Ionicons name={item.icon as any} size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
                  </View>
                  <Text className={`text-[14px] font-extrabold ${
                    enabled ? 'text-appText dark:text-appDarkText' : 'text-appMuted dark:text-appDarkMuted'
                  }`}>
                    {item.label}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {item.value && (
                    <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">
                      {item.value}
                    </Text>
                  )}
                  {!enabled && (
                    <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                      <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">{t(language, 'common.comingSoon')}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#44403c' : '#d6d3d1'} />
                </View>
              </TouchableOpacity>
            );
          })}

          <View className="px-4 py-4 flex-row items-center justify-between border-t border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                <Ionicons name="notifications" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </View>
              <View>
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">
                  {t(language, 'profile.notifications')}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e7e5e4', true: '#10B981' }}
              thumbColor="white"
            />
          </View>

          <View className="px-4 py-4 flex-row items-center justify-between border-t border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                <Ionicons name="moon" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </View>
              <View>
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'profile.darkMode')}</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#e7e5e4', true: '#10B981' }}
              thumbColor="white"
            />
          </View>
        </View>

        <Text className="text-center text-[10px] text-appMuted dark:text-appDarkMuted mt-8">
          Tiny Habits v1.0.0
        </Text>
      </ScrollView>

      <BottomSheet
        visible={showLanguageSheet}
        title={t(language, 'profile.languageTitle')}
        onClose={() => setShowLanguageSheet(false)}
      >
        <View className="px-5 pb-8 gap-3">
          <TouchableOpacity
            onPress={() => { setLanguage('zh'); setShowLanguageSheet(false); }}
            activeOpacity={0.85}
            className="py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder flex-row items-center justify-between px-4"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">
              {t(language, 'profile.languageZh')}
            </Text>
            {language === 'zh' && (
              <Ionicons name="checkmark" size={18} color="#10B981" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setLanguage('en'); setShowLanguageSheet(false); }}
            activeOpacity={0.85}
            className="py-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder flex-row items-center justify-between px-4"
          >
            <Text className="text-appText dark:text-appDarkText font-extrabold">
              {t(language, 'profile.languageEn')}
            </Text>
            {language === 'en' && (
              <Ionicons name="checkmark" size={18} color="#10B981" />
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
