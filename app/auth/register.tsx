import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores';
import { useRegister } from '../../services/api';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function isValidPhone(value: string) {
  return /^\d{6,}$/.test(value.trim());
}

export default function RegisterScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((s) => s.isDarkMode);
  
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
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">注册</Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} className="w-10 h-10 rounded-2xl bg-appCard dark:bg-appDarkCard border border-appBorder dark:border-appDarkBorder items-center justify-center">
              <Ionicons name="arrow-back" size={18} color={isDarkMode ? '#d6d3d1' : '#78716c'} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="gap-3">
          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder px-4 h-[56px] flex-row items-center">
            <Ionicons name="person-outline" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="输入昵称"
              autoCapitalize="words"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="next"
            />
          </View>
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
              placeholder="设置登录密码（至少6位）"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.85} className="w-10 h-full items-center justify-center -mr-2">
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            </TouchableOpacity>
          </View>
          
          {registerMutation.isError && (
            <Text className="text-[12px] font-semibold text-red-500 px-2">
              {registerMutation.meta?.getErrorMessage?.(registerMutation.error) || '注册失败'}
            </Text>
          )}
        </View>

        <View className="mt-5">
          <TouchableOpacity
            onPress={handleRegister}
            disabled={!validUsername || !validIdentifier || !validPassword || registerMutation.isPending}
            activeOpacity={0.9}
            className={`py-4 rounded-[22px] items-center flex-row justify-center ${
              validUsername && validIdentifier && validPassword && !registerMutation.isPending
                ? 'bg-appText dark:bg-appDarkText' 
                : 'bg-appBorder dark:bg-appDarkBorder'
            }`}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator size="small" color={isDarkMode ? '#0c0a09' : '#ffffff'} />
            ) : (
              <Text className={`text-[14px] font-extrabold ${
                validUsername && validIdentifier && validPassword 
                  ? 'text-white dark:text-appText' 
                  : 'text-appMuted dark:text-appDarkMuted'
              }`}>
                注册并登录
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="text-[12px] font-semibold text-appMuted dark:text-appDarkMuted">已有账号？</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.85} className="ml-1">
              <Text className="text-[12px] font-extrabold text-primary">去登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
