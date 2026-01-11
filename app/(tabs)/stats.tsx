import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore, useHabitStore } from '../../stores';

export default function StatsScreen() {
  const { totalPoints } = useUserStore();
  const { microBehaviors, checkIns, todayCheckIns } = useHabitStore();

  // 获取今日打卡的习惯详情
  const todayMoments = todayCheckIns.map(checkIn => {
    const habit = microBehaviors.find(h => h.id === checkIn.microBehaviorId);
    return {
      ...checkIn,
      habit,
    };
  }).filter(m => m.habit);

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-800">
      <View className="px-5 py-3">
        <Text className="text-xl font-bold text-stone-700 dark:text-stone-100">统计</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <View className="bg-primary p-5 rounded-[20px] mb-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm text-white/90">累计行动值</Text>
            <Ionicons name="flash" size={20} color="#FCD34D" />
          </View>
          <Text className="text-3xl font-bold text-white">{totalPoints}</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white dark:bg-stone-700 p-5 rounded-[20px] border border-stone-200 dark:border-stone-600">
            <Text className="text-xs text-stone-400 mb-1">习惯数量</Text>
            <Text className="text-2xl font-bold text-stone-700 dark:text-stone-100">
              {microBehaviors.length}
            </Text>
          </View>
          <View className="flex-1 bg-white dark:bg-stone-700 p-5 rounded-[20px] border border-stone-200 dark:border-stone-600">
            <Text className="text-xs text-stone-400 mb-1">总打卡</Text>
            <Text className="text-2xl font-bold text-stone-700 dark:text-stone-100">
              {checkIns.length}
            </Text>
          </View>
        </View>

        {/* Today's Shining Moments */}
        <View className="mb-5">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="star" size={16} color="#a8a29e" />
            <Text className="text-sm font-semibold text-stone-700 dark:text-stone-100">今日发光时刻</Text>
          </View>

          {todayMoments.length === 0 ? (
            <View className="bg-white dark:bg-stone-700 p-6 rounded-2xl border border-stone-200 dark:border-stone-600 items-center">
              <Ionicons name="sunny-outline" size={32} color="#a8a29e" />
              <Text className="text-sm text-stone-400 mt-2">今天还没有打卡记录</Text>
              <Text className="text-xs text-stone-300 dark:text-stone-500 mt-1">完成习惯后这里会显示你的发光时刻</Text>
            </View>
          ) : (
            <View className="relative">
              <View className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-stone-200 dark:bg-stone-600" />
              <View className="gap-4">
                {todayMoments.map((moment) => (
                  <View key={moment.id} className="flex-row gap-3">
                    <View className="w-4 h-4 rounded-full bg-primary mt-1 z-10" />
                    <View className="flex-1 bg-white dark:bg-stone-700 p-4 rounded-2xl border border-stone-200 dark:border-stone-600">
                      <View className="flex-row items-start gap-3">
                        <View className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-stone-600 items-center justify-center">
                          <Text className="text-2xl">{moment.habit?.icon || '✨'}</Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-sm font-bold text-stone-700 dark:text-stone-100">
                              {moment.habit?.name}
                            </Text>
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="time-outline" size={12} color="#a8a29e" />
                              <Text className="text-xs text-stone-400">
                                {new Date(moment.completedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-xs text-stone-500 dark:text-stone-400">
                            庆祝方式：<Text className="text-primary font-semibold">{moment.habit?.celebration}</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Badges */}
        <Text className="text-sm font-semibold text-stone-700 dark:text-stone-100 mb-3">勋章</Text>
        <View className="flex-row gap-3 pb-8">
          <View className="flex-1 bg-white dark:bg-stone-700 p-4 rounded-2xl border border-stone-200 dark:border-stone-600 items-center">
            <Text className="text-2xl mb-1">🌱</Text>
            <Text className="text-[11px] font-medium text-stone-600 dark:text-stone-300">萌芽期</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-stone-700 p-4 rounded-2xl border border-stone-200 dark:border-stone-600 items-center opacity-40">
            <Text className="text-2xl mb-1">🌳</Text>
            <Text className="text-[11px] font-medium text-stone-400">成长期</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-stone-700 p-4 rounded-2xl border border-stone-200 dark:border-stone-600 items-center opacity-40">
            <Text className="text-2xl mb-1">💎</Text>
            <Text className="text-[11px] font-medium text-stone-400">大师</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
