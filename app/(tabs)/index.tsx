import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHabitStore, useUserStore } from '../../stores';
import { HabitCard, CelebrationModal } from '../../components/habit';

export default function HomeScreen() {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState('');

  const { microBehaviors, todayCheckIns, checkIn, uncheckIn } = useHabitStore();
  const { totalPoints, addPoints } = useUserStore();

  const todayBehaviors = microBehaviors.filter((b) => {
    const today = new Date().getDay();
    return b.isActive && b.frequency.includes(today);
  });

  const handleCheck = useCallback((behavior: typeof microBehaviors[0]) => {
    const isChecked = todayCheckIns.includes(behavior.id);

    if (!isChecked) {
      checkIn(behavior.id, behavior.habitId);
      addPoints(1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentCelebration(behavior.celebration);
      setShowCelebration(true);
    } else {
      uncheckIn(behavior.id);
    }
  }, [todayCheckIns, checkIn, uncheckIn, addPoints]);

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-800">
      {/* Header */}
      <View className="px-5 py-3 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-stone-700 dark:text-stone-100">我的配方</Text>
        <View className="flex-row items-center gap-1.5 bg-white dark:bg-stone-700 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-600">
          <Ionicons name="flash" size={16} color="#F9A825" />
          <Text className="text-sm font-bold text-stone-700 dark:text-stone-100">{totalPoints}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Daily Energy Card */}
        <TouchableOpacity
          className="mb-6 rounded-[20px] bg-primary p-6 overflow-hidden"
          activeOpacity={0.9}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <View className="bg-white/20 px-2.5 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">✨ 今日能量</Text>
            </View>
          </View>
          <Text className="text-white text-[15px] font-bold leading-relaxed">
            每一个微小的开始，都通向伟大的改变。
          </Text>
        </TouchableOpacity>

        {/* Habits List */}
        <View className="gap-4 pb-8">
          {todayBehaviors.length === 0 ? (
            <View className="bg-white dark:bg-stone-700 p-8 rounded-[20px] border border-stone-200 dark:border-stone-600 items-center">
              <Text className="text-4xl mb-3">🌱</Text>
              <Text className="text-stone-500 dark:text-stone-300 text-center">
                还没有习惯配方{'\n'}点击下方 + 创建第一个吧
              </Text>
            </View>
          ) : (
            todayBehaviors.map((behavior) => (
              <HabitCard
                key={behavior.id}
                behavior={behavior}
                isChecked={todayCheckIns.includes(behavior.id)}
                onCheck={() => handleCheck(behavior)}
                onPress={() => router.push(`/detail/${behavior.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CelebrationModal
        visible={showCelebration}
        celebration={currentCelebration}
        onClose={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}
