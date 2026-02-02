import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore, useAuthStore } from '../../stores';
import { themeColors } from '../../stores/authStore';
import { HabitCard, CelebrationModal, ConfirmModal } from '../../components/habit';
import { getTodayBackendDay } from '../../utils/dateHelper';
import { useUserMicroBehaviors, useCheckIn, useTodayCheckIns, useCancelCheckIn } from '../../services/api/hooks';
import { Alert } from 'react-native';
import { t } from '../../utils/i18n';
import { scheduleHabitReminders } from '../../services/notifications';

export default function HomeScreen() {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [behaviorToCancel, setBehaviorToCancel] = useState<any>(null);

  const { todayCheckIns: localCheckIns, checkIn: localCheckIn, uncheckIn: localUncheckIn } = useHabitStore();
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const language = useAuthStore((state) => state.language);
  const notificationsEnabled = useAuthStore((state) => state.notificationsEnabled);
  const themeColor = useAuthStore((state) => state.themeColor);
  const totalPoints = user?.totalPoints || 0;

  // 获取当前主题色
  const currentTheme = themeColors[themeColor];
  // 生成渐变色（主色 + 稍浅的主色）
  const gradientColors: [string, string] = isDarkMode
    ? [currentTheme.primary + 'CC', currentTheme.primary]
    : [currentTheme.primary, currentTheme.primary + 'CC'];

  // 已登录：从后端获取用户的微行为列表和今日打卡记录
  const { data: cloudBehaviors = [], isLoading, error } = useUserMicroBehaviors(user?.id);
  const { data: cloudCheckIns = [] } = useTodayCheckIns(user?.id);
  const checkInMutation = useCheckIn();
  const cancelCheckInMutation = useCancelCheckIn();

  // 未登录：使用本地数据
  const localBehaviors = useHabitStore((s) => s.microBehaviors);

  // 根据登录状态选择数据源
  const microBehaviors = user?.id ? cloudBehaviors : localBehaviors;
  const todayCheckIns = user?.id
    ? cloudCheckIns.map(c => c.microBehaviorId.toString())
    : localCheckIns;

  const reminderKey = useMemo(
    () =>
      microBehaviors
        .map((b) => `${b.id}-${b.reminderEnabled}-${b.reminderTime}-${b.frequency?.join(',')}`)
        .join('|'),
    [microBehaviors]
  );

  useEffect(() => {
    scheduleHabitReminders(microBehaviors, language, notificationsEnabled);
  }, [reminderKey, language, microBehaviors, notificationsEnabled]);

  const todayBehaviors = microBehaviors.filter((b) => {
    const today = getTodayBackendDay(); // 使用工具函数获取后端格式的今天
    return b.isActive && b.frequency.includes(today);
  });

  const checkedCount = todayBehaviors.filter((b) => todayCheckIns.includes(b.id)).length;
  const hasTodayBehaviors = todayBehaviors.length > 0;
  const progressRatio = hasTodayBehaviors ? checkedCount / todayBehaviors.length : 0;
  const progressWidth = `${Math.min(progressRatio * 100, 100)}%`;
  const isAllDone = hasTodayBehaviors && checkedCount === todayBehaviors.length;
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
            Alert.alert(t(language, 'common.confirm'), t(language, 'home.checkinDone'));
          } else {
            Alert.alert(t(language, 'home.checkinFailed'), error.message || t(language, 'common.tryLater'));
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
      // 取消打卡 - 显示自定义确认弹窗
      setBehaviorToCancel(behavior);
      setShowCancelConfirm(true);
    }
  }, [todayCheckIns, user?.id, checkInMutation, localCheckIn, localUncheckIn]);

  // 确认取消打卡
  const handleConfirmCancel = async () => {
    if (!behaviorToCancel) return;

    if (!user?.id) {
      // 未登录用户：使用本地存储
      localUncheckIn(behaviorToCancel.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      // 已登录用户：调用后端接口
      try {
        await cancelCheckInMutation.mutateAsync({
          microBehaviorId: Number(behaviorToCancel.id),
          habitId: behaviorToCancel.habitId ? Number(behaviorToCancel.habitId) : null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error: any) {
        console.error('取消打卡失败:', error);
        Alert.alert(t(language, 'common.error'), error.message || t(language, 'common.tryLater'));
      }
    }

    setShowCancelConfirm(false);
    setBehaviorToCancel(null);
  };

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
              <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
                {t(language, 'common.home')}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 bg-appCard dark:bg-appDarkCard px-3 py-2 rounded-2xl border border-appBorder dark:border-appDarkBorder">
              <Ionicons name="flash" size={16} color="#F9A825" />
              <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
                {totalPoints}
              </Text>
            </View>
          </View>

          {hasTodayBehaviors && (
            <View className="mt-4 bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
              <View className="flex-row items-center">
                <View>
                  <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
                    {t(language, 'home.progressTitle')}
                  </Text>
                  <View className="flex-row items-baseline mt-1">
                    <Text className="text-3xl font-extrabold text-appText dark:text-appDarkText">
                      {checkedCount}
                    </Text>
                    <Text className="text-[13px] font-bold text-appMuted dark:text-appDarkMuted ml-1">
                      / {todayBehaviors.length} {t(language, 'common.items')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-3 h-2 rounded-full bg-appBorder dark:bg-appDarkBorder overflow-hidden">
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: progressWidth, height: '100%' }}
                />
              </View>
            </View>
          )}

          {isAllDone && (
            <View
              className="mt-3 px-3.5 py-2.5 rounded-[16px] flex-row items-center gap-2"
              style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : currentTheme.primary + '10',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : currentTheme.primary + '22',
              }}
            >
              <View className="w-8 h-8 rounded-2xl items-center justify-center" style={{ backgroundColor: currentTheme.primary + '20' }}>
                <Text className="text-base">✨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-appMuted dark:text-appDarkMuted">
                  {t(language, 'home.energyTitle')}
                </Text>
                <Text className="text-[12px] font-semibold text-appText dark:text-appDarkText mt-0.5">
                  {t(language, 'home.energyLine')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
              {t(language, 'home.today')}
            </Text>
          </View>
          {todayBehaviors.length > 0 && (
            <View className="px-3 py-1.5 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
              <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                {todayBehaviors.length} {t(language, 'common.items')}
              </Text>
            </View>
          )}
        </View>

        <View className="gap-3">
          {isLoading ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <ActivityIndicator size="large" color={currentTheme.primary} />
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed mt-3">
                {t(language, 'common.loading')}
              </Text>
            </View>
          ) : error ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-4xl mb-3">⚠️</Text>
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed">
                {t(language, 'discover.loadingFailed')}
              </Text>
            </View>
          ) : todayBehaviors.length === 0 ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-4xl mb-3">🌱</Text>
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed">
                {t(language, 'home.noToday')}
              </Text>
              <Pressable
                onPress={() => router.push('/create')}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                className="mt-5 bg-appText dark:bg-appDarkText px-4 py-3 rounded-2xl"
              >
                <Text className="text-white dark:text-appText font-bold">
                  {t(language, 'home.createFirst')}
                </Text>
              </Pressable>
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

      <ConfirmModal
        visible={showCancelConfirm}
        title={t(language, 'home.cancelTitle')}
        message={t(language, 'home.cancelMessage')}
        cancelText={t(language, 'home.cancelKeep')}
        confirmText={t(language, 'home.cancelConfirm')}
        onCancel={() => {
          setShowCancelConfirm(false);
          setBehaviorToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
      />
    </SafeAreaView>
  );
}
