import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore, useUserStore } from '../../stores';

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { microBehaviors, checkIns, deleteMicroBehavior } = useHabitStore();
  const isDarkMode = useUserStore((state) => state.isDarkMode);

  const behavior = microBehaviors.find((b) => b.id === id);
  const behaviorCheckIns = checkIns.filter((c) => c.microBehaviorId === id);

  if (!behavior) {
    return (
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center">
        <Text className="text-appMuted dark:text-appDarkMuted">习惯不存在</Text>
      </SafeAreaView>
    );
  }

  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const handleDelete = () => {
    Alert.alert('删除习惯', '确定删除这个习惯配方吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteMicroBehavior(id);
          router.back();
        },
      },
    ]);
  };

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
                习惯详情
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
                      <Text className="text-white text-[11px] font-bold">我的配方</Text>
                    </View>
                    <View className="px-2.5 py-1 rounded-full bg-white/15">
                      <Text className="text-white text-[11px] font-bold">当 {behavior.anchor} 后</Text>
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
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">打卡天数</Text>
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">
              {behaviorCheckIns.length}
            </Text>
          </View>
          <View className="flex-1 bg-appCard dark:bg-appDarkCard p-5 rounded-[22px] border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mb-1">行动值</Text>
            <Text className="text-2xl font-extrabold text-primary">
              {behaviorCheckIns.length}
            </Text>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText mb-3">
            配方
          </Text>
          <View className="bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                <Text className="text-[20px]">⏰</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">锚点</Text>
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
                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">微行为</Text>
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
                <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">庆祝</Text>
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
            删除此配方
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
