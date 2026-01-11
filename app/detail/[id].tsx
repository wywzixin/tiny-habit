import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../stores';

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { microBehaviors, checkIns, deleteMicroBehavior } = useHabitStore();

  const behavior = microBehaviors.find((b) => b.id === id);
  const behaviorCheckIns = checkIns.filter((c) => c.microBehaviorId === id);

  if (!behavior) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
        <Text className="text-stone-400">习惯不存在</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    deleteMicroBehavior(id);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      {/* Header */}
      <View className="px-5 py-3 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <Ionicons name="arrow-back" size={24} color="#57534e" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/edit/${id}`)}>
          <Text className="text-sm font-medium text-stone-400">编辑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="items-center py-4">
          <Text className="text-xl font-bold text-stone-700 mb-1">
            {behavior.behavior}
          </Text>
          <Text className="text-sm text-stone-400">当 {behavior.anchor} 后</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 items-center">
            <Text className="text-[10px] text-stone-400 font-medium mb-1">打卡天数</Text>
            <Text className="text-2xl font-bold text-stone-700">
              {behaviorCheckIns.length}
            </Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 items-center">
            <Text className="text-[10px] text-stone-400 font-medium mb-1">行动值</Text>
            <Text className="text-2xl font-bold text-primary">
              {behaviorCheckIns.length}
            </Text>
          </View>
        </View>

        {/* Recipe Card */}
        <View className="bg-white p-5 rounded-[20px] border border-stone-200 mb-5">
          <Text className="text-xs font-semibold text-stone-400 uppercase mb-4">
            配方详情
          </Text>
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-stone-100 items-center justify-center">
                <Text className="text-lg">🛌</Text>
              </View>
              <View>
                <Text className="text-[10px] text-stone-400 font-medium">锚点</Text>
                <Text className="text-sm font-semibold text-stone-700">
                  当{behavior.anchor}后
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-primary-light items-center justify-center">
                <Text className="text-lg">💧</Text>
              </View>
              <View>
                <Text className="text-[10px] text-primary font-medium">微行为</Text>
                <Text className="text-sm font-semibold text-stone-700">
                  {behavior.behavior}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-stone-100 items-center justify-center">
                <Text className="text-lg">✨</Text>
              </View>
              <View>
                <Text className="text-[10px] text-stone-400 font-medium">庆祝</Text>
                <Text className="text-sm font-semibold text-stone-700">
                  {behavior.celebration}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          className="py-3 rounded-xl border border-red-100 bg-red-50/50 mb-8"
        >
          <Text className="text-sm font-medium text-red-400 text-center">
            删除此配方
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
