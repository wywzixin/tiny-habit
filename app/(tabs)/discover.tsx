import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores';
import { useRecipeTemplates, useAddFromTemplate } from '../../services/api/hooks';
import { getLocale, t } from '../../utils/i18n';

export default function DiscoverScreen() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const user = useAuthStore((s) => s.user);
  const language = useAuthStore((s) => s.language);
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const categoryOptions = [
    { value: '全部', label: t(language, 'discover.all') },
    { value: '推荐', label: t(language, 'discover.categoryRecommend') },
    { value: '健康', label: t(language, 'discover.categoryHealth') },
    { value: '学习', label: t(language, 'discover.categoryStudy') },
    { value: '心理', label: t(language, 'discover.categoryMind') },
    { value: '运动', label: t(language, 'discover.categorySport') },
  ];

  // 获取配方模板列表（已登录用户从后端获取，未登录用户不请求）
  const { data: recipes = [], isLoading, error } = useRecipeTemplates(
    selectedCategory === '全部' ? undefined : selectedCategory,
    { enabled: !!user?.id } // 仅在已登录时调用
  );
  
  // 从模板添加微行为
  const addFromTemplateMutation = useAddFromTemplate();

  const todayLabel = new Date().toLocaleDateString(getLocale(language), {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.anchor.includes(search) || r.behavior.includes(search) || r.name.includes(search);
    return matchesSearch;
  });

  const handleAdd = async (templateId: number) => {
    // 未登录用户提示
    if (!user?.id) {
      Alert.alert(t(language, 'common.confirm'), t(language, 'auth.loginRequired'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await addFromTemplateMutation.mutateAsync({
        templateId,
        frequency: [1, 2, 3, 4, 5, 6, 7], // 默认每天
        reminderEnabled: false,
      });
      
      setAddedIds((prev) => [...prev, templateId]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 3秒后移除已添加标记
      setTimeout(() => {
        setAddedIds((prev) => prev.filter((id) => id !== templateId));
      }, 3000);
    } catch (error: any) {
      console.error('添加配方失败:', error);
      Alert.alert(t(language, 'discover.addFailed'), error.message || t(language, 'common.tryLater'));
    }
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
            {t(language, 'common.discover')}
          </Text>
          <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
            {t(language, 'home.startSimple')}
          </Text>

          <View className="mt-4 rounded-[22px] bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t(language, 'discover.search')}
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
              {categoryOptions.map((category) => {
                const active = selectedCategory === category.value;
                return (
                  <TouchableOpacity
                    key={category.value}
                    onPress={() => handleCategoryChange(category.value)}
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
                      {category.label}
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
              {t(language, 'discover.recommended')}
            </Text>
            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-0.5">
              {t(language, 'discover.tapToAdd')}
            </Text>
          </View>
          <View className="px-3 py-1.5 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder">
              <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                {filteredRecipes.length} {t(language, 'common.items')}
              </Text>
          </View>
        </View>

        <View className="gap-3">
          {isLoading ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <ActivityIndicator size="large" color="#10B981" />
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
          ) : filteredRecipes.length === 0 ? (
            <View className="bg-appCard dark:bg-appDarkCard p-8 rounded-[22px] border border-appBorder dark:border-appDarkBorder items-center">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-appMuted dark:text-appDarkMuted text-center leading-relaxed">
                {t(language, 'discover.empty')}
              </Text>
            </View>
          ) : (
            filteredRecipes.map((recipe) => {
              const justAdded = addedIds.includes(recipe.id);
              const alreadyAdded = recipe.isAdded; // 直接使用后端返回的字段
              const isAdded = justAdded || alreadyAdded;
              
              return (
                <View
                  key={recipe.id}
                  className={`bg-appCard dark:bg-appDarkCard p-4 rounded-[22px] border border-appBorder dark:border-appDarkBorder flex-row items-center ${
                    alreadyAdded ? 'opacity-60' : ''
                  }`}
                >
                  <View className="w-12 h-12 rounded-[16px] bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder items-center justify-center mr-3">
                    <Text className="text-[22px]">{recipe.icon}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText" numberOfLines={1}>
                        {recipe.name}
                      </Text>
                      <View className="px-2.5 py-1 rounded-full bg-appBg dark:bg-appDarkBg border border-appBorder dark:border-appDarkBorder">
                        <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                          {recipe.category}
                        </Text>
                      </View>
                      {alreadyAdded && (
                        <View className="px-2.5 py-1 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/25 dark:border-primary/30">
                          <Text className="text-[11px] font-bold text-primary">{t(language, 'discover.added')}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted mt-1.5">
                      {recipe.anchor} → {recipe.behavior}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleAdd(recipe.id)}
                    activeOpacity={0.85}
                    disabled={isAdded || addFromTemplateMutation.isPending}
                    className={`w-10 h-10 rounded-full items-center justify-center border ${
                      isAdded
                        ? 'bg-primary border-primary'
                        : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                    }`}
                  >
                    {addFromTemplateMutation.isPending ? (
                      <ActivityIndicator size="small" color={isDarkMode ? '#d6d3d1' : '#78716c'} />
                    ) : (
                      <Ionicons
                        name={isAdded ? 'checkmark' : 'add'}
                        size={20}
                        color={isAdded ? 'white' : (isDarkMode ? '#d6d3d1' : '#78716c')}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
