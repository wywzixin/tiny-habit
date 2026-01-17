import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore, useUserStore } from '../../stores';

export default function EditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { microBehaviors, updateMicroBehavior } = useHabitStore();
  const isDarkMode = useUserStore((s) => s.isDarkMode);

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
      <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg items-center justify-center">
        <Text className="text-appMuted dark:text-appDarkMuted">习惯不存在</Text>
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
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="px-3 py-2 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder"
          >
            <Text className="text-appMuted dark:text-appDarkMuted text-[12px] font-bold">取消</Text>
          </TouchableOpacity>

          <Text className="text-base font-extrabold text-appText dark:text-appDarkText">编辑配方</Text>

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className="px-3 py-2 rounded-2xl bg-appText dark:bg-appDarkText"
          >
            <Text className="text-white dark:text-appText text-[12px] font-extrabold">保存</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        <View className="gap-5">
          <View>
            <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-2">习惯名称</Text>
            <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 py-4 flex-row items-center">
              <Ionicons name="pencil" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="例如：喝一口水"
                className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              />
            </View>
          </View>

          <View>
            <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-2">锚点</Text>
            <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 py-4 flex-row items-center">
              <Ionicons name="flag" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              <TextInput
                value={anchor}
                onChangeText={setAnchor}
                placeholder="例如：起床后"
                className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              />
            </View>
          </View>

          <View>
            <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-2">微行为</Text>
            <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 py-4 flex-row items-center">
              <Ionicons name="flash" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              <TextInput
                value={behaviorText}
                onChangeText={setBehaviorText}
                placeholder="例如：喝一口水"
                className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              />
            </View>
          </View>

          <View>
            <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-2">庆祝方式</Text>
            <View className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-[22px] px-4 py-4 flex-row items-center">
              <Ionicons name="sparkles" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
              <TextInput
                value={celebration}
                onChangeText={setCelebration}
                placeholder="例如：对自己微笑"
                className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
                placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
