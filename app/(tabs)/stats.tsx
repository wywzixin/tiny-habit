import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useHabitStore } from '../../stores';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStats, useTodayCheckIns as useTodayStatsCheckIns } from '../../services/api/hooks/useStats';
import { useMemo } from 'react';
import { t } from '../../utils/i18n';
import { useTheme } from '../../hooks/useTheme';

export default function StatsScreen() {
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const { primary, primaryLight } = useTheme();
  const { microBehaviors, checkIns } = useHabitStore();

  // 已登录：从后端 API 获取统计数据
  const { data: cloudStats, isLoading: isLoadingStats, error: statsError } = useUserStats(user?.id);
  
  // 已登录：从后端 API 获取今日打卡数据
  const { data: cloudTodayCheckIns, isLoading: isLoadingTodayCheckIns, error: todayCheckInsError } = useTodayStatsCheckIns(user?.id);

  // 调试日志
  console.log('=== 统计页面调试 ===');
  console.log('用户ID:', user?.id);
  console.log('云端统计数据:', cloudStats);
  console.log('统计数据错误:', statsError);
  console.log('云端今日打卡:', cloudTodayCheckIns);
  console.log('今日打卡错误:', todayCheckInsError);
  console.log('本地微行为数量:', microBehaviors.length);
  console.log('本地打卡记录数量:', checkIns.length);

  // 统计数据：已登录用户使用云端数据，未登录用户使用本地数据
  const statsData = useMemo(() => {
    if (user?.id && cloudStats) {
      // 已登录：使用后端返回的统计数据
      console.log('使用云端统计数据:', cloudStats);
      console.log('微行为数量:', cloudStats.microBehaviorCount);
      console.log('打卡次数:', cloudStats.checkInCount);
      
      return {
        totalPoints: cloudStats.totalPoints || 0,
        microBehaviorCount: cloudStats.microBehaviorCount || 0,
        checkInCount: cloudStats.checkInCount || 0,
        level: cloudStats.level || 1,
        availablePoints: cloudStats.availablePoints || 0,
      };
    }

    // 未登录：使用本地 AsyncStorage 数据计算
    console.log('使用本地统计数据');
    return {
      totalPoints: checkIns.reduce((sum, c) => sum + (c.pointsEarned || 10), 0),
      microBehaviorCount: microBehaviors.length,
      checkInCount: checkIns.length,
      level: 1,
      availablePoints: 0,
    };
  }, [user?.id, cloudStats, microBehaviors, checkIns]);

  console.log('最终统计数据:', statsData);

  // 今日发光时刻数据：已登录用户使用云端数据，未登录用户使用本地数据
  const todayMomentsData = useMemo(() => {
    if (user?.id && cloudTodayCheckIns) {
      // 已登录：使用后端返回的今日打卡数据
      console.log('===== 今日打卡数据处理 =====');
      console.log('原始数据类型:', typeof cloudTodayCheckIns);
      console.log('是否为数组:', Array.isArray(cloudTodayCheckIns));
      console.log('数据长度:', cloudTodayCheckIns?.length);
      
      // 打印每个字段的详细信息
      if (cloudTodayCheckIns && cloudTodayCheckIns.length > 0) {
        cloudTodayCheckIns.forEach((item, index) => {
          console.log(`第 ${index} 条数据:`);
          console.log('  完整对象:', item);
          console.log('  所有键:', Object.keys(item));
          console.log('  icon 值:', item.icon, '类型:', typeof item.icon);
          console.log('  behavior 值:', item.behavior, '类型:', typeof item.behavior);
          console.log('  celebration 值:', item.celebration, '类型:', typeof item.celebration);
          console.log('  checkedAt 值:', item.checkedAt, '类型:', typeof item.checkedAt);
        });
      }
      
      const result = cloudTodayCheckIns.slice(0, 2);
      console.log('处理后的数据:', result);
      console.log('处理后第一条的 behavior:', result[0]?.behavior);
      return result;
    }

    // 未登录：使用本地数据计算
    console.log('使用本地今日打卡数据');
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const todayCheckInsFromHistory = checkIns
      .filter((c) => {
        const t = new Date(c.checkedAt).getTime();
        return t >= startOfToday.getTime() && t < startOfTomorrow.getTime();
      })
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
      .slice(0, 2);

    // 转换为统一格式
    const result = todayCheckInsFromHistory.map((checkIn) => {
      const habit = microBehaviors.find((h) => h.id === checkIn.microBehaviorId);
      return {
        icon: habit?.icon || '✨',
        behavior: habit?.behavior || t(language, 'home.completed'),
        celebration: habit?.celebration || '',
        checkedAt: checkIn.checkedAt,
        pointsEarned: checkIn.pointsEarned,
      };
    });
    console.log('本地今日打卡转换结果:', result);
    return result;
  }, [user?.id, cloudTodayCheckIns, checkIns, microBehaviors]);

  console.log('===== 最终渲染数据 =====');
  console.log('数量:', todayMomentsData?.length);
  if (todayMomentsData && todayMomentsData.length > 0) {
    console.log('第一条的 behavior:', todayMomentsData[0]?.behavior);
    console.log('第一条的 icon:', todayMomentsData[0]?.icon);
  }

  const language = useAuthStore((s) => s.language);
  // 加载状态
  if (user?.id && (isLoadingStats || isLoadingTodayCheckIns)) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primary} />
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mt-4">
            {t(language, 'stats.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="pt-2 pb-4">
          <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
            {t(language, 'common.stats')}
          </Text>

          <View className="mt-4">
            <View className="rounded-[20px] overflow-hidden border border-appBorder dark:border-appDarkBorder">
              <LinearGradient
                colors={[primary, primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 16 }}
              >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white/90 text-[11px] font-bold">{t(language, 'stats.totalPoints')}</Text>
                  <View className="flex-row items-end gap-2 mt-1">
                    <Text className="text-white text-4xl font-extrabold">
                      {statsData.totalPoints}
                    </Text>
                    {user?.id && (
                      <View className="px-2 py-0.5 rounded-full bg-white/15 border border-white/25 mb-1.5">
                        <Text className="text-white/80 text-[11px] font-bold">
                          Lv.{statsData.level}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="w-11 h-11 rounded-2xl bg-white/18 border border-white/25 items-center justify-center">
                  <Ionicons name="sparkles" size={20} color="white" />
                </View>
              </View>
            </LinearGradient>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'stats.habitCount')}</Text>
              <View className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 items-center justify-center">
                <Ionicons name="leaf-outline" size={16} color={primary} />
              </View>
            </View>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-2">
              {statsData.microBehaviorCount}
            </Text>
          </View>
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'stats.checkInCount')}</Text>
              <View className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 items-center justify-center">
                <Ionicons name="checkmark-done-outline" size={16} color={primary} />
              </View>
            </View>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-2">
              {statsData.checkInCount}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
                {t(language, 'stats.moments')}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
              <Ionicons name="star" size={14} color={primary} />
              <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                {todayMomentsData.length}
              </Text>
            </View>
          </View>

          {todayMomentsData.length === 0 ? (
            <View className="bg-appCard dark:bg-appDarkCard p-6 rounded-[18px] border border-appBorder dark:border-appDarkBorder items-center">
              <View className="w-12 h-12 rounded-full bg-primary/10 border border-primary/15 items-center justify-center mb-3">
                <Text className="text-2xl">🌤️</Text>
              </View>
              <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
                {t(language, 'stats.noMoments')}
              </Text>
              <Text className="text-xs font-semibold text-appMuted dark:text-appDarkMuted mt-1.5 text-center leading-relaxed">
                {t(language, 'stats.noMomentsHint')}
              </Text>
            </View>
          ) : (
            <View className="relative">
              <View className="absolute left-[10px] top-3 bottom-3 w-px bg-appBorder dark:bg-appDarkBorder" />
              <View className="gap-3">
                {todayMomentsData.map((moment, index) => {
                  console.log(`===== 渲染第 ${index} 条 =====`);
                  console.log('moment 对象:', moment);
                  console.log('moment.icon:', moment.icon);
                  console.log('moment.behavior:', moment.behavior);
                  console.log('moment.celebration:', moment.celebration);
                  
                  const timeText = new Date(moment.checkedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <View key={`${moment.checkedAt}-${index}`} className="flex-row gap-3">
                      <View className="w-5 items-center">
                        <View className="w-3 h-3 rounded-full mt-3 z-10" style={{ backgroundColor: primary }} />
                      </View>
                      <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder">
                        <View className="flex-row items-start gap-3">
                          <View className="w-10 h-10 rounded-[14px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                            <Text className="text-[20px]">{moment.icon || '❓'}</Text>
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText" numberOfLines={1}>
                              {moment.behavior || t(language, 'stats.noBehavior')}
                            </Text>
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="time-outline" size={13} color={isDarkMode ? '#a8a29e' : '#78716c'} />
                                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
                                  {timeText}
                                </Text>
                              </View>
                            </View>

                            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-2">
                              {t(language, 'stats.celebration')}：
                              <Text className="font-extrabold" style={{ color: primary }}>
                                {moment.celebration || t(language, 'stats.noCelebration')}
                              </Text>
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View className="mb-2">
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText mb-3">{t(language, 'stats.badges')}</Text>
          <View className="flex-row gap-3">
            <View className={`flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder items-center ${statsData.checkInCount >= 1 ? '' : 'opacity-60'}`}>
              <View className="w-10 h-10 rounded-full bg-primary/10 border border-primary/15 items-center justify-center mb-2">
                <Text className="text-[20px]">🌱</Text>
              </View>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'stats.badgeSeed')}</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                {statsData.checkInCount >= 1 ? t(language, 'stats.unlocked') : t(language, 'stats.unlockOnce')}
              </Text>
            </View>
            
            <View className={`flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder items-center ${statsData.checkInCount >= 10 ? '' : 'opacity-60'}`}>
              <View className="w-10 h-10 rounded-full bg-primary/10 border border-primary/15 items-center justify-center mb-2">
                <Text className="text-[20px]">🌳</Text>
              </View>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'stats.badgeGrowth')}</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                {statsData.checkInCount >= 10 ? t(language, 'stats.unlocked') : `${statsData.checkInCount}/10`}
              </Text>
            </View>
            
            <View className={`flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[18px] border border-appBorder dark:border-appDarkBorder items-center ${statsData.checkInCount >= 50 ? '' : 'opacity-60'}`}>
              <View className="w-10 h-10 rounded-full bg-primary/10 border border-primary/15 items-center justify-center mb-2">
                <Text className="text-[20px]">💎</Text>
              </View>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">{t(language, 'stats.badgeMaster')}</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                {statsData.checkInCount >= 50 ? t(language, 'stats.unlocked') : `${statsData.checkInCount}/50`}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
