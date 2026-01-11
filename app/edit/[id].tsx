import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../stores';

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { microBehaviors, updateMicroBehavior } = useHabitStore();

  const behavior = microBehaviors.find((b) => b.id === id);

  const [name, setName] = useState('');
  const [anchor, setAnchor] = useState('');
  const [behaviorText, setBehaviorText] = useState('');
  const [celebration, setCelebration] = useState('');

  useEffect(() => {
    if (behavior) {
      setName(behavior.name);
      setAnchor(behavior.anchor);
      setBehaviorText(behavior.behavior);
      setCelebration(behavior.celebration);
    }
  }, [behavior]);

  if (!behavior) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
        <Text className="text-stone-400">习惯不存在</Text>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    updateMicroBehavior(id, {
      name,
      anchor,
      behavior: behaviorText,
      celebration,
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      {/* Header */}
      <View className="px-5 py-3 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-stone-400 text-sm font-medium">取消</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-stone-700">编辑配方</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-sm font-semibold text-primary">保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View className="mb-6">
          <Text className="text-base font-bold text-stone-700 mb-1">习惯名称</Text>
          <Text className="text-xs text-stone-400 mb-3">给你的习惯起个名字</Text>
          <View className="bg-white p-1 rounded-xl border border-stone-200 flex-row items-center">
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="pencil" size={20} color="#a8a29e" />
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              className="flex-1 h-10 text-[15px] font-semibold text-stone-700"
            />
          </View>
        </View>

        <View className="border-t border-stone-100 mb-6" />

        {/* Anchor */}
        <View className="mb-6">
          <Text className="text-base font-bold text-stone-700 mb-1">锚点</Text>
          <Text className="text-xs text-stone-400 mb-3">当...之后</Text>
          <View className="bg-white p-1 rounded-xl border border-stone-200 flex-row items-center">
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="flag" size={20} color="#a8a29e" />
            </View>
            <TextInput
              value={anchor}
              onChangeText={setAnchor}
              className="flex-1 h-10 text-[15px] font-semibold text-stone-700"
            />
          </View>
        </View>

        <View className="border-t border-stone-100 mb-6" />

        {/* Behavior */}
        <View className="mb-6">
          <Text className="text-base font-bold text-stone-700 mb-1">微行为</Text>
          <Text className="text-xs text-stone-400 mb-3">我会...</Text>
          <View className="bg-white p-1 rounded-xl border border-stone-200 flex-row items-center">
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="flash" size={20} color="#a8a29e" />
            </View>
            <TextInput
              value={behaviorText}
              onChangeText={setBehaviorText}
              className="flex-1 h-10 text-[15px] font-semibold text-stone-700"
            />
          </View>
        </View>

        <View className="border-t border-stone-100 mb-6" />

        {/* Celebration */}
        <View className="mb-6">
          <Text className="text-base font-bold text-stone-700 mb-1">庆祝方式</Text>
          <Text className="text-xs text-stone-400 mb-3">然后...</Text>
          <View className="bg-white p-1 rounded-xl border border-stone-200 flex-row items-center">
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="sparkles" size={20} color="#a8a29e" />
            </View>
            <TextInput
              value={celebration}
              onChangeText={setCelebration}
              className="flex-1 h-10 text-[15px] font-semibold text-stone-700"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
