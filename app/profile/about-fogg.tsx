import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, themeColors } from '../../stores/authStore';
import { t } from '../../utils/i18n';

export default function AboutFoggScreen() {
  const router = useRouter();
  const { isDarkMode, language, themeColor } = useAuthStore();
  const currentTheme = themeColors[themeColor];

  const openLearnMore = () => {
    Linking.openURL('https://behaviormodel.org/');
  };

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
            {t(language, 'fogg.title')}
          </Text>

          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* 核心公式卡片 */}
        <View className="mb-6">
          <LinearGradient
            colors={[currentTheme.primary, currentTheme.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 24 }}
          >
            <Text className="text-white/80 text-sm font-bold mb-2">
              {t(language, 'fogg.formulaTitle')}
            </Text>
            <Text className="text-white text-2xl font-extrabold mb-4">
              B = MAP
            </Text>
            <Text className="text-white/90 text-base font-semibold">
              {t(language, 'fogg.formulaDesc')}
            </Text>

            {/* 公式元素 */}
            <View className="flex-row justify-between mt-6">
              <View className="items-center">
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mb-2">
                  <Text className="text-2xl">🎯</Text>
                </View>
                <Text className="text-white font-bold text-xs">M</Text>
                <Text className="text-white/70 text-[10px]">{t(language, 'fogg.motivation')}</Text>
              </View>
              <View className="items-center justify-center">
                <Text className="text-white text-2xl font-bold">×</Text>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mb-2">
                  <Text className="text-2xl">⚡</Text>
                </View>
                <Text className="text-white font-bold text-xs">A</Text>
                <Text className="text-white/70 text-[10px]">{t(language, 'fogg.ability')}</Text>
              </View>
              <View className="items-center justify-center">
                <Text className="text-white text-2xl font-bold">×</Text>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mb-2">
                  <Text className="text-2xl">🔔</Text>
                </View>
                <Text className="text-white font-bold text-xs">P</Text>
                <Text className="text-white/70 text-[10px]">{t(language, 'fogg.prompt')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* MAP 详解 */}
        <View className="mb-6">
          {/* Motivation */}
          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-5 mb-3">
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <Text className="text-lg">🎯</Text>
              </View>
              <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText flex-1">
                {t(language, 'fogg.motivationTitle')}
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-appMuted dark:text-appDarkMuted leading-relaxed mb-3">
              {t(language, 'fogg.motivationDesc')}
            </Text>
            <View
              className="px-3 py-2 rounded-xl"
              style={{ backgroundColor: currentTheme.primaryLight }}
            >
              <Text
                className="text-[12px] font-bold"
                style={{ color: currentTheme.primary }}
              >
                {t(language, 'fogg.motivationTip')}
              </Text>
            </View>
          </View>

          {/* Ability */}
          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-5 mb-3">
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#DBEAFE' }}
              >
                <Text className="text-lg">⚡</Text>
              </View>
              <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText flex-1">
                {t(language, 'fogg.abilityTitle')}
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-appMuted dark:text-appDarkMuted leading-relaxed mb-3">
              {t(language, 'fogg.abilityDesc')}
            </Text>
            <View
              className="px-3 py-2 rounded-xl"
              style={{ backgroundColor: currentTheme.primaryLight }}
            >
              <Text
                className="text-[12px] font-bold"
                style={{ color: currentTheme.primary }}
              >
                {t(language, 'fogg.abilityTip')}
              </Text>
            </View>
          </View>

          {/* Prompt */}
          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-5">
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#FCE7F3' }}
              >
                <Text className="text-lg">🔔</Text>
              </View>
              <Text className="text-[15px] font-extrabold text-appText dark:text-appDarkText flex-1">
                {t(language, 'fogg.promptTitle')}
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-appMuted dark:text-appDarkMuted leading-relaxed mb-3">
              {t(language, 'fogg.promptDesc')}
            </Text>
            <View
              className="px-3 py-2 rounded-xl"
              style={{ backgroundColor: currentTheme.primaryLight }}
            >
              <Text
                className="text-[12px] font-bold"
                style={{ color: currentTheme.primary }}
              >
                {t(language, 'fogg.promptTip')}
              </Text>
            </View>
          </View>
        </View>

        {/* 配方公式 */}
        <View className="mb-6">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'fogg.recipeTitle')}
          </Text>
          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-5">
            <Text
              className="text-[15px] font-extrabold text-center leading-relaxed"
              style={{ color: currentTheme.primary }}
            >
              {t(language, 'fogg.recipeFormula')}
            </Text>
          </View>
        </View>

        {/* 示例 */}
        <View className="mb-6">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'fogg.exampleTitle')}
          </Text>
          <View className="gap-3">
            <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">🪥</Text>
                <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                  {language === 'zh' ? '示例 1' : 'Example 1'}
                </Text>
              </View>
              <Text className="text-[13px] font-semibold text-appText dark:text-appDarkText leading-relaxed">
                {t(language, 'fogg.example1')}
              </Text>
            </View>
            <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">☕</Text>
                <Text className="text-[11px] font-bold text-appMuted dark:text-appDarkMuted">
                  {language === 'zh' ? '示例 2' : 'Example 2'}
                </Text>
              </View>
              <Text className="text-[13px] font-semibold text-appText dark:text-appDarkText leading-relaxed">
                {t(language, 'fogg.example2')}
              </Text>
            </View>
          </View>
        </View>

        {/* 成功秘诀 */}
        <View className="mb-6">
          <Text className="text-lg font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'fogg.tipsTitle')}
          </Text>
          <View className="gap-3">
            <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-4 flex-row">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text className="text-lg">🌱</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText mb-1">
                  {t(language, 'fogg.tip1Title')}
                </Text>
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted leading-relaxed">
                  {t(language, 'fogg.tip1Desc')}
                </Text>
              </View>
            </View>

            <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-4 flex-row">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text className="text-lg">⚓</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText mb-1">
                  {t(language, 'fogg.tip2Title')}
                </Text>
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted leading-relaxed">
                  {t(language, 'fogg.tip2Desc')}
                </Text>
              </View>
            </View>

            <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder p-4 flex-row">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: currentTheme.primaryLight }}
              >
                <Text className="text-lg">🎉</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-extrabold text-appText dark:text-appDarkText mb-1">
                  {t(language, 'fogg.tip3Title')}
                </Text>
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted leading-relaxed">
                  {t(language, 'fogg.tip3Desc')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 了解更多 */}
        <TouchableOpacity
          onPress={openLearnMore}
          activeOpacity={0.9}
          className="py-4 rounded-[22px] items-center mb-4"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="globe-outline" size={18} color="white" />
            <Text className="text-white font-extrabold">
              {t(language, 'fogg.learnMore')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 作者信息 */}
        <Text className="text-center text-[11px] text-appMuted dark:text-appDarkMuted leading-relaxed">
          {t(language, 'fogg.authorInfo')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
