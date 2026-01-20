import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';
import { t } from '../../utils/i18n';

export default function FeedbackScreen() {
  const router = useRouter();
  const { isDarkMode, language, user } = useAuthStore();
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'other'>('feature');
  const [contact, setContact] = useState('');
  const [content, setContent] = useState('');

  const feedbackTypes = [
    { value: 'bug', label: t(language, 'feedback.typeBug'), icon: 'bug' },
    { value: 'feature', label: t(language, 'feedback.typeFeature'), icon: 'bulb' },
    { value: 'other', label: t(language, 'feedback.typeOther'), icon: 'chatbubble-ellipses' },
  ];

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert(t(language, 'common.error'), t(language, 'feedback.contentRequired'));
      return;
    }

    // 构建邮件内容
    const subject = `[Tiny Habits ${t(language, 'feedback.subject')}] ${feedbackTypes.find(t => t.value === feedbackType)?.label}`;
    const body = `
${t(language, 'feedback.typeLabel')}: ${feedbackTypes.find(t => t.value === feedbackType)?.label}
${t(language, 'feedback.userLabel')}: ${user?.username || t(language, 'profile.notLoggedIn')}
${t(language, 'feedback.contactLabel')}: ${contact || t(language, 'feedback.contactEmpty')}

${t(language, 'feedback.contentLabel')}:
${content}

---
Tiny Habits v1.0.0
    `.trim();

    const mailto = `mailto:support@tinyhabits.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
        Alert.alert(
          t(language, 'common.success'),
          t(language, 'feedback.thankYou'),
          [
            {
              text: t(language, 'common.confirm'),
              onPress: () => router.back(),
            },
          ]
        );
        setContent('');
        setContact('');
      } else {
        Alert.alert(t(language, 'common.error'), t(language, 'feedback.emailNotConfigured'));
      }
    } catch (error) {
      Alert.alert(t(language, 'common.error'), t(language, 'common.tryLater'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#d6d3d1' : '#44403c'} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-appText dark:text-appDarkText">
          {t(language, 'profile.feedback')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* 反馈类型 */}
        <View className="mb-5">
          <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'feedback.selectType')}
          </Text>
          <View className="flex-row gap-3">
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setFeedbackType(type.value as any)}
                activeOpacity={0.85}
                className={`flex-1 py-3 px-3 rounded-2xl border ${
                  feedbackType === type.value
                    ? 'bg-primary border-primary'
                    : 'bg-appCard dark:bg-appDarkCard border-appBorder dark:border-appDarkBorder'
                }`}
              >
                <View className="items-center gap-1">
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={feedbackType === type.value ? '#fff' : (isDarkMode ? '#d6d3d1' : '#78716c')}
                  />
                  <Text
                    className={`text-[11px] font-bold ${
                      feedbackType === type.value
                        ? 'text-white'
                        : 'text-appMuted dark:text-appDarkMuted'
                    }`}
                  >
                    {type.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 联系方式（可选） */}
        <View className="mb-5">
          <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'feedback.contact')}
            <Text className="text-appMuted dark:text-appDarkMuted font-semibold">
              {' '}({t(language, 'common.optional')})
            </Text>
          </Text>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder={t(language, 'feedback.contactPlaceholder')}
            placeholderTextColor={isDarkMode ? '#78716c' : '#a8a29e'}
            className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-2xl px-4 py-3 text-appText dark:text-appDarkText text-[14px] font-medium"
          />
        </View>

        {/* 反馈内容 */}
        <View className="mb-5">
          <Text className="text-[13px] font-extrabold text-appText dark:text-appDarkText mb-3">
            {t(language, 'feedback.content')}
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={t(language, 'feedback.contentPlaceholder')}
            placeholderTextColor={isDarkMode ? '#78716c' : '#a8a29e'}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            className="bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder rounded-2xl px-4 py-3 text-appText dark:text-appDarkText text-[14px] font-medium min-h-[160px]"
          />
        </View>

        {/* 提示信息 */}
        <View className="bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/30 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start gap-2">
            <Ionicons name="information-circle" size={18} color="#10B981" />
            <Text className="flex-1 text-[12px] font-semibold text-primary leading-relaxed">
              {t(language, 'feedback.tip')}
            </Text>
          </View>
        </View>

        {/* 提交按钮 */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          className="bg-appText dark:bg-appDarkText rounded-2xl py-4"
        >
          <Text className="text-white dark:text-appText text-center text-[15px] font-extrabold">
            {t(language, 'feedback.submit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
