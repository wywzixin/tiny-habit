import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores';
import { useRegister } from '../../services/api';
import { t } from '../../utils/i18n';
import { useTheme } from '../../hooks/useTheme';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function isValidPhone(value: string) {
  return /^\d{6,}$/.test(value.trim());
}

export default function RegisterScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  const language = useAuthStore((s) => s.language);
  const { primary } = useTheme();
  
  // 使用 React Query mutation
  const registerMutation = useRegister();

  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const normalizedIdentifier = identifier.trim();
  const validUsername = username.trim().length >= 2;
  const validIdentifier = isValidEmail(normalizedIdentifier) || isValidPhone(normalizedIdentifier);
  const validPassword = password.trim().length >= 6; // 后端要求最少 6 位

  const handleRegister = async () => {
    if (!validUsername || !validIdentifier || !validPassword) return;

    try {
      await registerMutation.mutateAsync({
        username: username.trim(),
        account: normalizedIdentifier,
        password: password.trim(),
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)'); // 注册成功跳转到首页
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // 错误信息已经在 mutation 中处理
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-appBg dark:bg-appDarkBg">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 36, flexGrow: 1 }}
      >
        <View className="pt-2 pb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">{t(language, 'auth.register')}</Text>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center">
              <Ionicons name="arrow-back" size={18} color={primary} />
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <View className="bg-appBg dark:bg-appDarkBg rounded-[18px] border border-appBorder dark:border-appDarkBorder px-4 h-[52px] flex-row items-center">
            <Ionicons name="person-outline" size={18} color={primary} />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={t(language, 'auth.username')}
              autoCapitalize="words"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="next"
            />
          </View>
          <View className="bg-appBg dark:bg-appDarkBg rounded-[18px] border border-appBorder dark:border-appDarkBorder px-4 h-[52px] flex-row items-center">
            <Ionicons name="mail-outline" size={18} color={primary} />
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
          <View className="bg-appBg dark:bg-appDarkBg rounded-[18px] border border-appBorder dark:border-appDarkBorder px-4 h-[52px] flex-row items-center">
            <Ionicons name="lock-closed-outline" size={18} color={primary} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t(language, 'auth.password')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} className="w-10 h-full items-center justify-center -mr-2">
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            </Pressable>
          </View>
          
          {registerMutation.isError && (
            <Text className="text-[12px] font-semibold text-red-500 px-2">
              {registerMutation.meta?.getErrorMessage?.(registerMutation.error) || t(language, 'auth.registerFailed')}
            </Text>
          )}
        </View>

        <View className="mt-5">
          <Pressable
            onPress={handleRegister}
            disabled={!validUsername || !validIdentifier || !validPassword || registerMutation.isPending}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            className={`py-4 rounded-[18px] items-center flex-row justify-center ${
              validUsername && validIdentifier && validPassword && !registerMutation.isPending
                ? 'bg-primary' 
                : 'bg-appBorder dark:bg-appDarkBorder'
            }`}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className={`text-[14px] font-extrabold ${
                validUsername && validIdentifier && validPassword 
                  ? 'text-white dark:text-appText' 
                  : 'text-appMuted dark:text-appDarkMuted'
              }`}>
                {t(language, 'auth.registerCta')}
              </Text>
            )}
          </Pressable>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">{t(language, 'auth.hasAccount')}</Text>
            <Pressable onPress={() => router.replace('/auth/login')} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} className="ml-1">
              <Text className="text-[12px] font-extrabold" style={{ color: primary }}>{t(language, 'auth.gotoLogin')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
