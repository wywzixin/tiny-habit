import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore, ThemeColor, themeColors } from '../../stores/authStore';
import { t } from '../../utils/i18n';

export default function ThemeScreen() {
  const router = useRouter();
  const { isDarkMode, language, themeColor, setThemeColor } = useAuthStore();

  const themeOptions: { key: ThemeColor; nameKey: string }[] = [
    { key: 'green', nameKey: 'theme.green' },
    { key: 'blue', nameKey: 'theme.blue' },
    { key: 'purple', nameKey: 'theme.purple' },
    { key: 'orange', nameKey: 'theme.orange' },
    { key: 'pink', nameKey: 'theme.pink' },
  ];

  const handleSelectTheme = (color: ThemeColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setThemeColor(color);
  };

  const currentTheme = themeColors[themeColor];

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color={isDarkMode ? '#d6d3d1' : '#44403c'} />
          </TouchableOpacity>

          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText">
            {t(language, 'theme.title')}
          </Text>

          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* 主题配色选择 */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-1">
            {t(language, 'theme.colorTitle')}
          </Text>
          <Text className="text-sm font-semibold text-appMuted dark:text-appDarkMuted mb-4">
            {t(language, 'theme.colorHint')}
          </Text>

          <View className="gap-3">
            {themeOptions.map((option) => {
              const theme = themeColors[option.key];
              const isSelected = themeColor === option.key;

              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleSelectTheme(option.key)}
                  activeOpacity={0.88}
                  className={`p-4 rounded-[22px] border flex-row items-center ${
                    isSelected
                      ? 'border-2'
                      : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                  }`}
                  style={isSelected ? { borderColor: theme.primary, backgroundColor: theme.primaryLight + '30' } : {}}
                >
                  {/* 颜色预览圆点 */}
                  <View
                    className="w-12 h-12 rounded-full mr-4 items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="white" />
                    )}
                  </View>

                  {/* 主题名称 */}
                  <View className="flex-1">
                    <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                      {t(language, option.nameKey)}
                    </Text>
                    <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                      {theme.primary}
                    </Text>
                  </View>

                  {/* 当前标签 */}
                  {isSelected && (
                    <View
                      className="px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Text className="text-[11px] font-bold text-white">
                        {t(language, 'theme.current')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 预览效果 */}
        <View className="mb-8">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-4">
            {t(language, 'theme.preview')}
          </Text>

          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-5">
            {/* 模拟卡片 */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-12 h-12 rounded-[16px] mr-3 items-center justify-center"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text className="text-xl">💧</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText">
                  {language === 'zh' ? '多喝水' : 'Drink water'}
                </Text>
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted mt-1">
                  {language === 'zh' ? '起床后 · 喝一口水' : 'After waking up · Sip water'}
                </Text>
              </View>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
            </View>

            {/* 模拟按钮 */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="py-3 rounded-[18px] items-center"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Text className="text-white font-extrabold">
                {language === 'zh' ? '完成打卡' : 'Check In'}
              </Text>
            </TouchableOpacity>

            {/* 模拟标签 */}
            <View className="flex-row gap-2 mt-4">
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text
                  className="text-[12px] font-bold"
                  style={{ color: currentTheme.primary }}
                >
                  {language === 'zh' ? '简单' : 'Easy'}
                </Text>
              </View>
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text
                  className="text-[12px] font-bold"
                  style={{ color: currentTheme.primary }}
                >
                  {language === 'zh' ? '健康' : 'Health'}
                </Text>
              </View>
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text
                  className="text-[12px] font-bold"
                  style={{ color: currentTheme.primary }}
                >
                  +10 {language === 'zh' ? '行动值' : 'pts'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
