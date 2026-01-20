import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore, useRewardStore } from '../stores';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useUserRewards, useCreateReward, useRedeemReward } from '../services/api/hooks';
import { useUserStats } from '../services/api/hooks/useStats';
import { getLocale, t } from '../utils/i18n';

const icons = ['📚', '🎬', '🎮', '☕', '🍰', '🎁', '✈️', '🎸', '👕', '💄', '🎨', '🏃'];

export default function RewardsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const language = useAuthStore((s) => s.language);
  
  // 本地存储（未登录用户）
  const { rewards: localRewards, addReward: addLocalReward, redeemReward: redeemLocalReward } = useRewardStore();
  
  // 云端数据（已登录用户）
  const { data: cloudRewards, isLoading } = useUserRewards(user?.id);
  const { data: cloudStats } = useUserStats(user?.id);
  const createRewardMutation = useCreateReward();
  const redeemRewardMutation = useRedeemReward();

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

  const availablePoints = user?.availablePoints || 0;
  const totalPoints = user?.totalPoints || 0;
  const redeemedPoints = (totalPoints - availablePoints) || 0;

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');

  const todayLabel = new Date().toLocaleDateString(getLocale(language), {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  // 奖励列表：已登录用户使用云端数据，未登录用户使用本地数据
  const rewards = useMemo(() => {
    if (user?.id && cloudRewards) {
      // 已登录：使用云端数据，转换为统一格式
      return cloudRewards.map(r => ({
        id: r.id.toString(),
        userId: r.userId.toString(),
        name: r.name,
        icon: r.icon,
        cost: r.cost,
        status: r.status,
        redeemedAt: r.redeemedAt,
        createdAt: r.createdAt,
      }));
    }
    // 未登录：使用本地数据
    return localRewards;
  }, [user?.id, cloudRewards, localRewards]);

  const handleAddReward = async () => {
    if (!name || !cost) return;
    
    const costNum = parseInt(cost);
    if (costNum < 10) {
      Alert.alert(t(language, 'common.confirm'), t(language, 'rewards.minCost'));
      return;
    }

    try {
      if (user?.id) {
        // 已登录：调用后端 API
        await createRewardMutation.mutateAsync({
          userId: user.id,
          name,
          icon: selectedIcon,
          cost: costNum,
        });
      } else {
        // 未登录：保存到本地
        addLocalReward({ userId: '1', name, icon: selectedIcon, cost: costNum });
      }
      
      setShowModal(false);
      setName('');
      setCost('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(t(language, 'rewards.addFailed'), error.message || t(language, 'common.tryLater'));
    }
  };

  const handleRedeem = async (id: string, cost: number) => {
    if (availablePoints < cost) {
      Alert.alert(t(language, 'rewards.pointsInsufficient'), `${t(language, 'rewards.needPoints')} ${cost}，${t(language, 'rewards.availablePoints')} ${availablePoints}`);
      return;
    }

    try {
      if (user?.id) {
        // 已登录：调用后端 API
        await redeemRewardMutation.mutateAsync({
          rewardId: parseInt(id),
          cost,
        });
      } else {
        // 未登录：更新本地数据
        redeemLocalReward(id);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(t(language, 'rewards.redeemFailed'), error.message || t(language, 'common.tryLater'));
    }
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
                {t(language, 'rewards.title')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
            >
              <Ionicons name="arrow-back" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <LinearGradient
              colors={isDarkMode ? ['#059669', '#10B981'] : ['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 16 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white/90 text-[11px] font-bold">{t(language, 'rewards.availablePoints')}</Text>
                  <Text className="text-white text-4xl font-extrabold mt-1">{availablePoints}</Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-white/18 items-center justify-center">
                  <Text className="text-2xl">🎁</Text>
                </View>
              </View>
              <View className="mt-4 flex-row gap-2">
                <View className="px-3 py-2 rounded-2xl bg-white/15">
                  <Text className="text-white/90 text-[11px] font-bold">{t(language, 'rewards.totalPoints')} {totalPoints}</Text>
                </View>
                <View className="px-3 py-2 rounded-2xl bg-white/15">
                  <Text className="text-white/90 text-[11px] font-bold">{t(language, 'rewards.redeemedPoints')} {redeemedPoints}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
            {t(language, 'rewards.myRewards')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
            className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-appText dark:bg-appDarkText"
          >
            <Ionicons name="add" size={16} color={isDarkMode ? '#0c0a09' : 'white'} />
            <Text className="text-[12px] font-extrabold text-white dark:text-appText">
              {t(language, 'rewards.create')}
            </Text>
          </TouchableOpacity>
        </View>

        {rewards.length === 0 ? (
          <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
            <Text className="text-4xl mb-3">🎁</Text>
            <Text className="text-sm font-extrabold text-appText dark:text-appDarkText">
              {t(language, 'rewards.empty')}
            </Text>
            <Text className="text-xs font-semibold text-appMuted dark:text-appDarkMuted mt-2 text-center leading-relaxed">
              {t(language, 'rewards.emptyHint')}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {rewards.map((reward) => {
              const redeemed = reward.status === 'redeemed';
              const canRedeem = availablePoints >= reward.cost;

              return (
                <View
                  key={reward.id}
                  className={`bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder ${
                    redeemed ? 'opacity-60' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center">
                      <Text className="text-[22px]">{reward.icon}</Text>
                    </View>

                    <View className="flex-1">
                      <Text className={`text-[15px] font-extrabold text-appText dark:text-appDarkText ${
                        redeemed ? 'line-through' : ''
                      }`}>
                        {reward.name}
                      </Text>
                      <View className="mt-2 flex-row items-center gap-2">
                        <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                          <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                            {reward.cost} {t(language, 'common.points')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {redeemed ? (
                      <View className="px-3 py-2 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                        <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                          {t(language, 'rewards.redeemed')}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleRedeem(reward.id, reward.cost)}
                        disabled={!canRedeem}
                        activeOpacity={0.85}
                        className={`px-4 py-2 rounded-full ${
                          canRedeem ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'
                        }`}
                      >
                        <Text className={`text-[12px] font-extrabold ${
                          canRedeem ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
                        }`}>
                          {t(language, 'rewards.redeem')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomSheet
        visible={showModal}
        title={t(language, 'rewards.create')}
        onClose={() => setShowModal(false)}
      >
        <View className="px-5 pb-8">
          <Text className="text-xs font-bold text-appMuted dark:text-appDarkMuted mb-2">{t(language, 'rewards.rewardName')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t(language, 'rewards.rewardNamePlaceholder')}
            className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 py-4 text-[14px] font-semibold text-appText dark:text-appDarkText mb-4"
            placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
          />

          <Text className="text-xs font-bold text-appMuted dark:text-appDarkMuted mb-2">{t(language, 'rewards.rewardCost')}</Text>
          <TextInput
            value={cost}
            onChangeText={setCost}
            placeholder={t(language, 'rewards.costPlaceholder')}
            keyboardType="numeric"
            className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 py-4 text-[14px] font-semibold text-appText dark:text-appDarkText mb-4"
            placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
          />

          <Text className="text-xs font-bold text-appMuted dark:text-appDarkMuted mb-2">{t(language, 'rewards.selectIcon')}</Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {icons.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                activeOpacity={0.85}
                className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                  selectedIcon === icon
                    ? 'border-primary bg-primary/10 dark:bg-primary/15'
                    : 'border-appBorder dark:border-appDarkBorder bg-appCard dark:bg-appDarkCard'
                }`}
              >
                <Text className="text-2xl">{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleAddReward}
            activeOpacity={0.9}
            className="bg-appText dark:bg-appDarkText py-4 rounded-[22px] items-center"
          >
            <Text className="text-white dark:text-appText font-extrabold">{t(language, 'common.confirm')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
