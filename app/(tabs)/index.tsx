import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore, useAuthStore } from '../../stores';
import { HabitCard, CelebrationModal } from '../../components/habit';
import { getTodayBackendDay } from '../../utils/dateHelper';
import { useUserMicroBehaviors, useCheckIn, useTodayCheckIns } from '../../services/api/hooks';
import { Alert } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState('');

  const { todayCheckIns: localCheckIns, checkIn: localCheckIn, uncheckIn: localUncheckIn } = useHabitStore();
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const totalPoints = user?.totalPoints || 0;
  
  // 已登录：从后端获取用户的微行为列表和今日打卡记录
  const { data: cloudBehaviors = [], isLoading, error } = useUserMicroBehaviors(user?.id);
  const { data: cloudCheckIns = [] } = useTodayCheckIns(user?.id);
  const checkInMutation = useCheckIn();
  
  // 未登录：使用本地数据
  const localBehaviors = useHabitStore((s) => s.microBehaviors);
  
  // 根据登录状态选择数据源
  const microBehaviors = user?.id ? cloudBehaviors : localBehaviors;
  const todayCheckIns = user?.id 
    ? cloudCheckIns.map(c => c.microBehaviorId.toString()) 
    : localCheckIns;

  const todayBehaviors = microBehaviors.filter((b) => {
    const today = getTodayBackendDay(); // 使用工具函数获取后端格式的今天
    return b.isActive && b.frequency.includes(today);
  });

  const checkedCount = todayBehaviors.filter((b) => todayCheckIns.includes(b.id)).length;
  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const handleCheck = useCallback(async (behavior: typeof microBehaviors[0]) => {
    const isChecked = todayCheckIns.includes(behavior.id);

    if (!isChecked) {
      // 已登录：调用后端 API
      if (user?.id) {
        try {
          await checkInMutation.mutateAsync({
            microBehaviorId: Number(behavior.id),
            habitId: Number(behavior.habitId) || 0,
          });
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setCurrentCelebration(behavior.celebration);
          setShowCelebration(true);
        } catch (error: any) {
          console.error('打卡失败:', error);
          
          // 友好的错误提示
          if (error.message?.includes('已经打卡')) {
            Alert.alert('提示', '今天已经打卡过了');
          } else {
            Alert.alert('打卡失败', error.message || '请稍后重试');
          }
        }
      } 
      // 未登录：使用本地存储
      else {
        localCheckIn(behavior.id, behavior.habitId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCurrentCelebration(behavior.celebration);
        setShowCelebration(true);
      }
    } else {
      // 取消打卡（仅未登录用户支持）
      if (!user?.id) {
        localUncheckIn(behavior.id);
      } else {
        Alert.alert('提示', '已打卡的记录无法取消');
      }
    }
  }, [todayCheckIns, user?.id, checkInMutation, localCheckIn, localUncheckIn]);

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="pt-2 pb-4">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
                {todayLabel}
              </Text>
              <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
                我的配方
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1.5 bg-appCard dark:bg-appDarkCard px-3 py-2 rounded-2xl border border-appBorder dark:border-appDarkBorder">
                <Ionicons name="flash" size={16} color="#F9A825" />
                <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
                  {totalPoints}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/create')}
                activeOpacity={0.85}
                className="w-10 h-10 rounded-2xl bg-appText dark:bg-appDarkText items-center justify-center"
              >
                <Ionicons name="add" size={20} color={isDarkMode ? '#0c0a09' : 'white'} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            className="mt-4"
          >
            <LinearGradient
              colors={isDarkMode ? ['#059669', '#10B981'] : ['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 16 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2">
                    <View className="bg-white/15 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-[11px] font-bold">✨ 今日能量</Text>
                    </View>
                    <View className="bg-white/15 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-[11px] font-bold">
                        {checkedCount}/{todayBehaviors.length} 已完成
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white text-[15px] font-bold leading-relaxed mt-3">
                    每一个微小的开始，都通向伟大的改变。
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-white/18 items-center justify-center">
                  <Text className="text-2xl">🌿</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
              今天
            </Text>
            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-0.5">
              建议从最简单的一条开始
            </Text>
          </View>
          {todayBehaviors.length > 0 && (
            <View className="px-3 py-1.5 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
              <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                {todayBehaviors.length} 条
              </Text>
            </View>
          )}
        </View>

        <View className="gap-3">
          {isLoading ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed mt-3">
                加载中...
              </Text>
            </View>
          ) : error ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-4xl mb-3">⚠️</Text>
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed">
                加载失败，请稍后重试
              </Text>
            </View>
          ) : todayBehaviors.length === 0 ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-4xl mb-3">🌱</Text>
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed">
                还没有今天要做的配方
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/create')}
                activeOpacity={0.85}
                className="mt-5 bg-appText dark:bg-appDarkText px-4 py-3 rounded-2xl"
              >
                <Text className="text-white dark:text-appText font-bold">
                  创建第一个配方
                </Text>
              </TouchableOpacity>
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
