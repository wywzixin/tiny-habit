import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');

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
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-800">
      <View className="px-5 py-3">
        <Text className="text-xl font-bold text-stone-700 dark:text-stone-100 mb-3">发现</Text>

        {/* Search */}
        <View className="bg-white dark:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-600 flex-row items-center px-3 py-2 mb-3">
          <Ionicons name="search" size={16} color="#a8a29e" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="搜索习惯..."
            className="flex-1 ml-2 text-sm text-stone-700 dark:text-stone-100"
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategoryChange(category)}
                className={`px-3 py-1.5 rounded-lg ${
                  selectedCategory === category
                    ? 'bg-stone-700 dark:bg-primary'
                    : 'bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === category ? 'text-white' : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8">
          {filteredRecipes.map((recipe) => (
            <View
              key={recipe.id}
              className="bg-white dark:bg-stone-700 p-4 rounded-2xl border border-stone-200 dark:border-stone-600 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-600 items-center justify-center mr-3">
                <Text className="text-xl">{recipe.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-700 dark:text-stone-100">
                  {recipe.anchor}
                </Text>
                <Text className="text-xs text-stone-400 dark:text-stone-400 mt-0.5">
                  {recipe.behavior}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleAdd(recipe.id)}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  addedIds.includes(recipe.id) ? 'bg-primary' : 'bg-stone-100 dark:bg-stone-600'
                }`}
              >
                <Ionicons
                  name={addedIds.includes(recipe.id) ? 'checkmark' : 'add'}
                  size={16}
                  color={addedIds.includes(recipe.id) ? 'white' : '#a8a29e'}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
