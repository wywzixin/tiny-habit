import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../stores';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function isValidPhone(value: string) {
  return /^\d{6,}$/.test(value.trim());
}

export default function LoginScreen() {
  const router = useRouter();
  const isDarkMode = useUserStore((s) => s.isDarkMode);
  const { loginWithPassword, loginWithQQ, loginWithApple, loginWithWeibo } = useUserStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const normalizedIdentifier = identifier.trim();
  const validIdentifier = isValidEmail(normalizedIdentifier) || isValidPhone(normalizedIdentifier);
  const validPassword = password.trim().length >= 4;

  const handleLogin = () => {
    setError('');
    if (!validIdentifier || !validPassword) return;

    const ok = loginWithPassword(normalizedIdentifier, password);
    if (!ok) {
      setError('账号或密码不正确');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
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
                <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">登录</Text>
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
                  placeholder="输入邮箱或手机号"
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
                  placeholder="输入密码"
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
                  {error ? (
                    <Text className="text-[12px] font-semibold text-red-500">
                      {error}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => router.push('/auth/forgot')} activeOpacity={0.85}>
                  <Text className="text-[12px] font-extrabold text-primary">忘记密码？</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-6">
              <TouchableOpacity
                onPress={handleLogin}
                disabled={!validIdentifier || !validPassword}
                activeOpacity={0.9}
                className={`py-4 rounded-[22px] items-center ${
                  validIdentifier && validPassword ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'
                }`}
              >
                <Text className={`text-[14px] font-extrabold ${
                  validIdentifier && validPassword ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'
                }`}>
                  登录
                </Text>
              </TouchableOpacity>

              <View className="mt-4 flex-row items-center justify-center">
                <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">没有账号？</Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')} activeOpacity={0.85} className="ml-1">
                  <Text className="text-[12px] font-extrabold text-primary">去注册</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="pt-10">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-appBorder dark:bg-appDarkBorder" />
              <Text className="text-[11px] font-semibold text-appMuted dark:text-appDarkMuted">其他方式</Text>
              <View className="flex-1 h-px bg-appBorder dark:bg-appDarkBorder" />
            </View>
            <View className="mt-4 flex-row items-center justify-center gap-4">
              <TouchableOpacity
                onPress={() => { loginWithQQ(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
                activeOpacity={0.85}
                className="w-14 h-14 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <FontAwesome name="qq" size={22} color={isDarkMode ? '#f5f5f4' : '#0c0a09'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { loginWithWeibo(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
                activeOpacity={0.85}
                className="w-14 h-14 rounded-full bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center"
              >
                <FontAwesome name="weibo" size={22} color="#e6162d" />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => { loginWithApple(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }}
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
