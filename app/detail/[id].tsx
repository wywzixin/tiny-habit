import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore, useAuthStore } from '../../stores';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { queryClient, queryKeys } from '../../services/api/queryClient';
import * as Haptics from 'expo-haptics';
import { formatText, getLocale, t } from '../../utils/i18n';

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { microBehaviors, checkIns, deleteMicroBehavior } = useHabitStore();
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const language = useAuthStore((s) => s.language);

  // 已登录用户：从后端获取微行为详情
  const { data: cloudBehavior, isLoading } = useQuery({
    queryKey: ['microBehavior', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/micro-behavior/${id}`);
      return response.data.data;
    },
    enabled: !!user?.id && !!id,
  });

  // 根据登录状态选择数据源
  const behavior = user?.id ? cloudBehavior : microBehaviors.find((b) => b.id === id);
  const behaviorCheckIns = checkIns.filter((c) => c.microBehaviorId === id);

  // 删除微行为的 mutation（已登录用户）
  const deleteMutation = useMutation({
    mutationFn: async (microBehaviorId: string) => {
      const response = await apiClient.delete(`/api/micro-behavior/${microBehaviorId}`);
      return response.data;
    },
    onSuccess: () => {
      // 刷新微行为列表
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userMicroBehaviors(user.id.toString()),
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    onError: (error: any) => {
      console.error('删除微行为失败:', error);
      Alert.alert(t(language, 'detail.deleteFailed'), error.message || t(language, 'common.tryLater'));
    },
  });

  const handleDelete = () => {
    Alert.alert(t(language, 'detail.delete'), t(language, 'detail.deleteConfirm'), [
      { text: t(language, 'common.cancel'), style: 'cancel' },
      {
        text: t(language, 'detail.delete'),
        style: 'destructive',
        onPress: async () => {
          if (user?.id) {
            // 已登录：调用后端 API
            deleteMutation.mutate(id);
          } else {
            // 未登录：删除本地数据
            deleteMicroBehavior(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }
        },
      },
    ]);
  };

  // 加载中状态
  if (isLoading && user?.id) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-appMuted dark:text-appDarkMuted mt-3">{t(language, 'common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!behavior) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center">
        <Text className="text-4xl mb-3">🔍</Text>
        <Text className="text-appMuted dark:text-appDarkMuted">{t(language, 'detail.notFound')}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="mt-5 bg-appText dark:bg-appDarkText px-4 py-3 rounded-2xl"
        >
          <Text className="text-white dark:text-appText font-bold">{t(language, 'common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const todayLabel = new Date().toLocaleDateString(getLocale(language), {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="pt-2 pb-4">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
                {todayLabel}
              </Text>
              <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
                {t(language, 'detail.title')}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/edit/${id}`)}
                activeOpacity={0.85}
                className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <Ionicons name="create-outline" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.85}
                className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <Ionicons name="arrow-back" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4">
            <LinearGradient
              colors={isDarkMode ? ['#059669', '#10B981'] : ['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 16 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-2">
                    <View className="px-2.5 py-1 rounded-full bg-white/15">
                      <Text className="text-white text-[11px] font-bold">{t(language, 'detail.recipe')}</Text>
                    </View>
                    <View className="px-2.5 py-1 rounded-full bg-white/15">
                      <Text className="text-white text-[11px] font-bold">
                        {formatText(language, 'detail.after', { anchor: behavior.anchor })}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white text-[20px] font-extrabold mt-3" numberOfLines={2}>
                    {behavior.behavior}
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-white/18 items-center justify-center">
                  <Text className="text-2xl">{behavior.icon || '✨'}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-5 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">{t(language, 'detail.days')}</Text>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">
              {behaviorCheckIns.length}
            </Text>
          </View>
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-5 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">{t(language, 'detail.points')}</Text>
            <Text className="text-2xl font-extrabold text-primary">
              {behaviorCheckIns.length}
            </Text>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'detail.recipe')}
          </Text>
          <View className="bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                <Text className="text-[20px]">⏰</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'detail.anchor')}</Text>
                <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                  {behavior.anchor}
                </Text>
              </View>
            </View>

            <View className="h-px bg-appBorder dark:bg-appDarkBorder" />

            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-[16px] bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/25 items-center justify-center">
                <Text className="text-[20px]">⚡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'detail.behavior')}</Text>
                <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                  {behavior.behavior}
                </Text>
              </View>
            </View>

            <View className="h-px bg-appBorder dark:bg-appDarkBorder" />

            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                <Text className="text-[20px]">🎉</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'detail.celebration')}</Text>
                <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                  {behavior.celebration}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.9}
          className="py-4 rounded-[22px] border border-red-200/70 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/10 items-center"
        >
          <Text className="text-[14px] font-extrabold text-red-500">
            {t(language, 'detail.delete')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
