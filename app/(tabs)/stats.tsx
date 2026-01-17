import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore, useHabitStore } from '../../stores';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatsScreen() {
  const { totalPoints, isDarkMode } = useUserStore();
  const { microBehaviors, checkIns, todayCheckIns } = useHabitStore();

  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const todayCheckInsFromHistory = checkIns
    .filter((c) => {
      const t = new Date(c.checkedAt).getTime();
      return t >= startOfToday.getTime() && t < startOfTomorrow.getTime();
    })
    .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());

  const displayedTodayMoments = todayCheckInsFromHistory.slice(0, 2);

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
                      {totalPoints}
                    </Text>
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
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">习惯数量</Text>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">
              {microBehaviors.length}
            </Text>
          </View>
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-5 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">总打卡</Text>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">
              {checkIns.length}
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
                {displayedTodayMoments.length}
              </Text>
            </View>
          </View>

          {displayedTodayMoments.length === 0 ? (
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
                {displayedTodayMoments.map((moment) => {
                  const habit = microBehaviors.find((h) => h.id === moment.microBehaviorId);
                  const timeText = new Date(moment.checkedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <View key={moment.id} className="flex-row gap-3">
                      <View className="w-5 items-center">
                        <View className="w-3.5 h-3.5 rounded-full bg-primary mt-3 z-10" />
                      </View>
                      <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
                        <View className="flex-row items-start gap-3">
                          <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                            <Text className="text-[22px]">{habit?.icon || '✨'}</Text>
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText" numberOfLines={1}>
                                {habit?.behavior || '已完成'}
                              </Text>
                              <View className="flex-row items-center gap-1">
                                <Ionicons name="time-outline" size={14} color={isDarkMode ? '#a8a29e' : '#78716c'} />
                                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">
                                  {timeText}
                                </Text>
                              </View>
                            </View>

                            {habit?.anchor ? (
                              <View className="mt-2 flex-row items-center gap-2">
                                <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                                  <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                                    当 {habit.anchor} 后
                                  </Text>
                                </View>
                              </View>
                            ) : null}

                            {habit?.celebration ? (
                              <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-3">
                                庆祝：<Text className="text-primary font-extrabold">{habit.celebration}</Text>
                              </Text>
                            ) : null}
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
            <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-2xl mb-2">🌱</Text>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">萌芽期</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">从 1 次开始</Text>
            </View>
            <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center opacity-60">
              <Text className="text-2xl mb-2">🌳</Text>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">成长期</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">持续积累</Text>
            </View>
            <View className="flex-1 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center opacity-60">
              <Text className="text-2xl mb-2">💎</Text>
              <Text className="text-[12px] font-extrabold text-appText dark:text-appDarkText">大师</Text>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">终身习惯</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
