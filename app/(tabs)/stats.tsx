import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useHabitStore } from '../../stores';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStats, useTodayCheckIns } from '../../services/api/hooks';
import { useMemo } from 'react';

export default function StatsScreen() {
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const { microBehaviors, checkIns } = useHabitStore();

  // 已登录：从后端 API 获取统计数据
  const { data: cloudStats, isLoading: isLoadingStats, error: statsError } = useUserStats(user?.id);
  
  // 已登录：从后端 API 获取今日打卡数据
  const { data: cloudTodayCheckIns, isLoading: isLoadingTodayCheckIns, error: todayCheckInsError } = useTodayCheckIns(user?.id);

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
        behavior: habit?.behavior || '已完成',
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

  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  // 加载状态
  if (user?.id && (isLoadingStats || isLoadingTodayCheckIns)) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mt-4">
            加载统计数据...
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
          <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
            {todayLabel}
          </Text>
          <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
            统计
          </Text>

          <View className="mt-4">
            <LinearGradient
              colors={isDarkMode ? ['#059669', '#10B981'] : ['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 16 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white/90 text-[11px] font-bold">累计行动值</Text>
                  <View className="flex-row items-end gap-2 mt-1">
                    <Text className="text-white text-4xl font-extrabold">
                      {statsData.totalPoints}
                    </Text>
                    {user?.id && (
                      <Text className="text-white/70 text-sm font-bold mb-1.5">
                        Lv.{statsData.level}
                      </Text>
                    )}
                  </View>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-white/18 items-center justify-center">
                  <Text className="text-2xl">✨</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-5 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">微行为数量</Text>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">
              {statsData.microBehaviorCount}
            </Text>
          </View>
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-5 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">总打卡</Text>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">
              {statsData.checkInCount}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
                今日发光时刻
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={16} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              <Text className="text-[12px] font-extrabold text-appMuted dark:text-appDarkMuted">
                {todayMomentsData.length}
              </Text>
            </View>
          </View>

          {todayMomentsData.length === 0 ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-4xl mb-3">🌤️</Text>
              <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
                今天还没有打卡记录
              </Text>
              <Text className="text-xs font-semibold text-appMuted dark:text-appDarkMuted mt-2 text-center leading-relaxed">
                去首页完成一个微行为，这里会点亮你的进度
              </Text>
            </View>
          ) : (
            <View className="relative">
              <View className="absolute left-[10px] top-3 bottom-3 w-0.5 bg-appBorder dark:bg-appDarkBorder" />
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
                        <View className="w-3.5 h-3.5 rounded-full bg-primary mt-3 z-10" />
                      </View>
                      <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
                        <View className="flex-row items-start gap-3">
                          <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                            <Text className="text-[22px]">{moment.icon || '❓'}</Text>
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText" numberOfLines={1}>
                                {moment.behavior || '无行为描述'}
                              </Text>
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="time-outline" size={14} color={isDarkMode ? '#a8a29e' : '#78716c'} />
                                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">
                                  {timeText}
                                </Text>
                              </View>
                            </View>

                            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-3">
                              庆祝：<Text className="text-primary font-extrabold">{moment.celebration || '无庆祝方式'}</Text>
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
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText mb-3">勋章</Text>
          <View className="flex-row gap-3">
            {/* 萌芽期：1次打卡即可解锁 */}
            <View className={`flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center ${statsData.checkInCount >= 1 ? '' : 'opacity-60'}`}>
              <Text className="text-2xl mb-2">🌱</Text>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">萌芽期</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                {statsData.checkInCount >= 1 ? '已解锁' : '打卡1次解锁'}
              </Text>
            </View>
            
            {/* 成长期：10次打卡解锁 */}
            <View className={`flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center ${statsData.checkInCount >= 10 ? '' : 'opacity-60'}`}>
              <Text className="text-2xl mb-2">🌳</Text>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">成长期</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                {statsData.checkInCount >= 10 ? '已解锁' : `${statsData.checkInCount}/10`}
              </Text>
            </View>
            
            {/* 大师：50次打卡解锁 */}
            <View className={`flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center ${statsData.checkInCount >= 50 ? '' : 'opacity-60'}`}>
              <Text className="text-2xl mb-2">💎</Text>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">大师</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                {statsData.checkInCount >= 50 ? '已解锁' : `${statsData.checkInCount}/50`}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
