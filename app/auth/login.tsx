import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores';
import { useLogin } from '../../services/api';
import { t } from '../../utils/i18n';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function isValidPhone(value: string) {
  return /^\d{6,}$/.test(value.trim());
}

export default function LoginScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const language = useAuthStore((s) => s.language);
  
  // 使用 React Query mutation
  const loginMutation = useLogin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const normalizedIdentifier = identifier.trim();
  const validIdentifier = isValidEmail(normalizedIdentifier) || isValidPhone(normalizedIdentifier);
  const validPassword = password.trim().length >= 6; // 后端要求最少 6 位

  const handleLogin = async () => {
    if (!validIdentifier || !validPassword) return;

    try {
      await loginMutation.mutateAsync({
        account: normalizedIdentifier,
        password: password.trim(),
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)'); // 登录成功跳转到首页
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // 错误信息已经在 mutation 中处理
    }
  };
  
  // TODO: 第三方登录暂时保留原有逻辑，后续实现
  const handleThirdPartyLogin = (provider: string) => {
    console.log(`${provider} 登录功能待实现`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 36, flexGrow: 1 }}
      >
        <View className="flex-1 justify-between">
          <View>
            <View className="pb-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">{t(language, 'auth.login')}</Text>
                <TouchableOpacity
                  onPress={() => router.back()}
                  activeOpacity={0.85}
                  className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
                >
                  <Ionicons name="close" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="gap-3">
              <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder px-4 h-[56px] flex-row items-center">
                <Ionicons name="mail-outline" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder={t(language, 'auth.account')}
                  autoCapitalize="none"
                  keyboardType="default"
                  className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
                  placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
                  returnKeyType="next"
                />
              </View>

              <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder px-4 h-[56px] flex-row items-center">
                <Ionicons name="lock-closed-outline" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder={t(language, 'auth.password')}
                  autoCapitalize="none"
                  className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
                  placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  activeOpacity={0.85}
                  className="w-10 h-full items-center justify-center -mr-2"
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  {loginMutation.isError ? (
                    <Text className="text-[12px] font-semibold text-red-500">
                      {loginMutation.meta?.getErrorMessage?.(loginMutation.error) || t(language, 'auth.loginFailed')}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => router.push('/auth/forgot')} activeOpacity={0.85}>
                  <Text className="text-[12px] font-extrabold text-primary">{t(language, 'auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-6">
              <TouchableOpacity
                onPress={handleLogin}
                disabled={!validIdentifier || !validPassword || loginMutation.isPending}
                activeOpacity={0.9}
                className={`py-4 rounded-[22px] items-center flex-row justify-center ${
                  validIdentifier && validPassword && !loginMutation.isPending 
                    ? 'bg-appText dark:bg-appDarkText' 
                    : 'bg-appBorder dark:bg-appDarkBorder'
                }`}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator size="small" color={isDarkMode ? '#0c0a09' : '#ffffff'} />
                ) : (
                  <Text className={`text-[14px] font-extrabold ${
                    validIdentifier && validPassword ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
                  }`}>
                    {t(language, 'auth.loginCta')}
                  </Text>
                )}
              </TouchableOpacity>

              <View className="mt-4 flex-row items-center justify-center">
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'auth.noAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')} activeOpacity={0.85} className="ml-1">
                  <Text className="text-[12px] font-extrabold text-primary">{t(language, 'auth.gotoRegister')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="pt-10">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-appBorder dark:bg-appDarkBorder" />
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'auth.or')}</Text>
              <View className="flex-1 h-px bg-appBorder dark:bg-appDarkBorder" />
            </View>
            <View className="mt-4 flex-row items-center justify-center gap-4">
              <TouchableOpacity
                onPress={() => handleThirdPartyLogin('QQ')}
                activeOpacity={0.85}
                className="w-14 h-14 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <FontAwesome name="qq" size={22} color={isDarkMode ? '#f5f5f4' : '#0c0a09'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleThirdPartyLogin('微博')}
                activeOpacity={0.85}
                className="w-14 h-14 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <FontAwesome name="weibo" size={22} color="#e6162d" />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => handleThirdPartyLogin('Apple')}
                  activeOpacity={0.85}
                  className="w-14 h-14 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
                >
                  <Ionicons name="logo-apple" size={22} color={isDarkMode ? '#f5f5f4' : '#0c0a09'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
