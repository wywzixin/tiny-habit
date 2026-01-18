import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';
import { useUserStats } from '../../services/api/hooks/useStats';
import { useEffect, useRef } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, isLoggedIn, user, updateUser } = useAuthStore();
  
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

  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const level = Math.max(1, Math.floor(totalPoints / 50) + 1);
  const levelLabel = level <= 1 ? '新手' : level <= 3 ? '进阶' : level <= 6 ? '熟练' : '大师';

  const menuItems = [
    { icon: 'gift', label: '奖励中心', route: '/rewards' },
    { icon: 'color-palette', label: '主题样式' },
    { icon: 'globe', label: '语言设置' },
    { icon: 'notifications', label: '通知提醒' },
    { icon: 'book', label: '关于福格模型' },
    { icon: 'chatbubble', label: '反馈建议' },
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
            我的
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
                          {user?.username || '用户'}
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
                          未登录
                        </Text>
                        <TouchableOpacity
                          onPress={() => router.push('/auth/login')}
                          activeOpacity={0.9}
                          className="mt-2 px-3 py-1.5 rounded-full bg-appText dark:bg-appDarkText self-start"
                        >
                          <Text className="text-white dark:text-appText text-[12px] font-extrabold">
                            点我登录
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
            const enabled = Boolean(item.route);
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => enabled && router.push(item.route as any)}
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
                  {!enabled && (
                    <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                      <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">即将上线</Text>
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
                <Ionicons name="moon" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </View>
              <View>
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText">深色模式</Text>
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
    </SafeAreaView>
  );
}
