import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore, useRewardStore } from '../stores';

const icons = ['📚', '🎬', '🎮', '☕', '🍰', '🎁', '✈️', '🎸', '👕', '💄', '🎨', '🏃'];

export default function RewardsScreen() {
  const router = useRouter();
  const { availablePoints, totalPoints, redeemedPoints, redeemPoints } = useUserStore();
  const { rewards, addReward, redeemReward } = useRewardStore();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');

  const handleAddReward = () => {
    if (!name || !cost) return;
    addReward({ userId: '1', name, icon: selectedIcon, cost: parseInt(cost) });
    setShowModal(false);
    setName('');
    setCost('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRedeem = (id: string, cost: number) => {
    if (redeemPoints(cost)) {
      redeemReward(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      {/* Header */}
      <View className="px-5 py-3 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <Ionicons name="arrow-back" size={24} color="#57534e" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-stone-700">奖励中心</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Points Stats */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 items-center">
            <Text className="text-[10px] text-stone-400 font-medium mb-1">可用</Text>
            <Text className="text-2xl font-bold text-primary">{availablePoints}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 items-center">
            <Text className="text-[10px] text-stone-400 font-medium mb-1">累计</Text>
            <Text className="text-2xl font-bold text-stone-700">{totalPoints}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 items-center">
            <Text className="text-[10px] text-stone-400 font-medium mb-1">已兑换</Text>
            <Text className="text-2xl font-bold text-stone-400">{redeemedPoints}</Text>
          </View>
        </View>

        {/* Add Button */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm font-semibold text-stone-700">我的奖励</Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-primary rounded-lg"
          >
            <Ionicons name="add" size={14} color="white" />
            <Text className="text-xs font-medium text-white">添加奖励</Text>
          </TouchableOpacity>
        </View>

        {/* Rewards List */}
        {rewards.length === 0 ? (
          <View className="bg-white p-8 rounded-[20px] border border-stone-200 items-center">
            <Ionicons name="gift" size={32} color="#d6d3d1" />
            <Text className="text-sm text-stone-400 mt-3 mb-1">还没有奖励</Text>
            <Text className="text-xs text-stone-300">为自己设定一个奖励目标吧</Text>
          </View>
        ) : (
          <View className="gap-3 pb-8">
            {rewards.map((reward) => (
              <View
                key={reward.id}
                className={`bg-white p-4 rounded-2xl border border-stone-200 ${
                  reward.status === 'redeemed' ? 'opacity-60' : ''
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-xl bg-stone-100 items-center justify-center">
                    <Text className="text-2xl">{reward.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-bold text-stone-700 ${
                      reward.status === 'redeemed' ? 'line-through' : ''
                    }`}>
                      {reward.name}
                    </Text>
                    <Text className="text-xs text-stone-400 mt-0.5">
                      需要 {reward.cost} 行动值
                    </Text>
                  </View>
                  {reward.status === 'redeemed' ? (
                    <View className="px-3 py-1.5 bg-stone-100 rounded-lg">
                      <Text className="text-xs font-medium text-stone-400">已兑换</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleRedeem(reward.id, reward.cost)}
                      disabled={availablePoints < reward.cost}
                      className={`px-3 py-1.5 rounded-lg ${
                        availablePoints >= reward.cost ? 'bg-primary' : 'bg-stone-100'
                      }`}
                    >
                      <Text className={`text-xs font-medium ${
                        availablePoints >= reward.cost ? 'text-white' : 'text-stone-400'
                      }`}>
                        兑换
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-stone-700">添加奖励</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#a8a29e" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-medium text-stone-600 mb-2">奖励名称</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="例如：买一本书"
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm mb-4"
              placeholderTextColor="#d6d3d1"
            />

            <Text className="text-xs font-medium text-stone-600 mb-2">所需行动值</Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              placeholder="例如：50"
              keyboardType="numeric"
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm mb-4"
              placeholderTextColor="#d6d3d1"
            />

            <Text className="text-xs font-medium text-stone-600 mb-2">选择图标</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {icons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-xl items-center justify-center border ${
                    selectedIcon === icon ? 'border-primary bg-primary-light' : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <Text className="text-2xl">{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAddReward}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">确认添加</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
