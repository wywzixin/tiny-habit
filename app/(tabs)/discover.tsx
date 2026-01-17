import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../stores';

const categories = ['全部', '健康', '生活', '心理', '效率'];

const recipes = [
  { id: '1', icon: '🛌', anchor: '双脚落地后', behavior: '说一句"今天很棒"', category: '心理' },
  { id: '2', icon: '🪥', anchor: '刷完牙后', behavior: '用牙线清洁一颗牙', category: '健康' },
  { id: '3', icon: '☕', anchor: '倒好咖啡后', behavior: '做两次深呼吸', category: '心理' },
  { id: '4', icon: '🧼', anchor: '洗完手后', behavior: '涂一点护手霜', category: '健康' },
  { id: '5', icon: '📱', anchor: '打开手机后', behavior: '先喝一口水', category: '健康' },
  { id: '6', icon: '🚗', anchor: '坐进车里后', behavior: '系好安全带', category: '生活' },
  { id: '7', icon: '💻', anchor: '打开电脑后', behavior: '整理桌面文件', category: '效率' },
  { id: '8', icon: '🌙', anchor: '躺下睡觉前', behavior: '感恩三件事', category: '心理' },
  { id: '9', icon: '🏃', anchor: '起床后', behavior: '做5个深蹲', category: '健康' },
  { id: '10', icon: '📖', anchor: '睡前', behavior: '读一页书', category: '效率' },
  { id: '11', icon: '🧘', anchor: '午休后', behavior: '冥想1分钟', category: '心理' },
  { id: '12', icon: '🍎', anchor: '吃饭前', behavior: '先吃一口蔬菜', category: '健康' },
];

export default function DiscoverScreen() {
  const isDarkMode = useUserStore((state) => state.isDarkMode);
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const todayLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.anchor.includes(search) || r.behavior.includes(search);
    const matchesCategory = selectedCategory === '全部' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAdd = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (category: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(category);
  };

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <View className="pt-2 pb-4">
          <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">
            {todayLabel}
          </Text>
          <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText mt-0.5">
            发现
          </Text>
          <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
            从配方库里挑几条最简单的开始
          </Text>

          <View className="mt-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="搜索锚点或微行为..."
              className="flex-1 ml-2 text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                activeOpacity={0.85}
                className="w-8 h-8 rounded-full bg-appBg dark:bg-appDarkCard items-center justify-center border border-appBorder dark:border-appDarkBorder"
              >
                <Ionicons name="close" size={16} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row gap-2 pr-3">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => handleCategoryChange(category)}
                    activeOpacity={0.85}
                    className={`px-4 py-2 rounded-full border ${
                      active
                        ? 'bg-appText dark:bg-appDarkText border-appText dark:border-appDarkText'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        active ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
                      }`}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-extrabold text-appText dark:text-appDarkText">
              推荐配方
            </Text>
            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-0.5">
              轻轻一点就能加入今天
            </Text>
          </View>
          <View className="px-3 py-1.5 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
            <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
              {filteredRecipes.length} 条
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {filteredRecipes.map((recipe) => {
            const added = addedIds.includes(recipe.id);
            return (
              <View
                key={recipe.id}
                className="bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder flex-row items-center"
              >
                <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center mr-3">
                  <Text className="text-[22px]">{recipe.icon}</Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText" numberOfLines={1}>
                      {recipe.anchor}
                    </Text>
                    <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                      <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                        {recipe.category}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-2" numberOfLines={2}>
                    {recipe.behavior}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleAdd(recipe.id)}
                  activeOpacity={0.85}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${
                    added
                      ? 'bg-primary border-primary'
                      : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                  }`}
                >
                  <Ionicons
                    name={added ? 'checkmark' : 'add'}
                    size={20}
                    color={added ? 'white' : (isDarkMode ? '#d6d3d1' : '#78716c')}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
