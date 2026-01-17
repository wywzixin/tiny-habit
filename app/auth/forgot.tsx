import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../stores';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function isValidPhone(value: string) {
  return /^\d{6,}$/.test(value.trim());
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const isDarkMode = useUserStore((s) => s.isDarkMode);
  const { resetPassword } = useUserStore();

  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const normalizedIdentifier = identifier.trim();
  const validIdentifier = isValidEmail(normalizedIdentifier) || isValidPhone(normalizedIdentifier);
  const validPassword = newPassword.trim().length >= 4;
  const matchPassword = newPassword === confirmPassword;

  const canSubmit = validIdentifier && validPassword && matchPassword;

  const handleSubmit = () => {
    setError('');
    if (!validIdentifier) {
      setError('请输入邮箱或手机号');
      return;
    }
    if (!validPassword) {
      setError('密码至少 4 位');
      return;
    }
    if (!matchPassword) {
      setError('两次密码不一致');
      return;
    }
    resetPassword(normalizedIdentifier, newPassword);
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
        <View className="pb-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-appText dark:text-appDarkText">忘记密码</Text>
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
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="设置新密码"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.85} className="w-10 h-full items-center justify-center -mr-2">
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            </TouchableOpacity>
          </View>

          <View className="bg-appCard dark:bg-appDarkCard rounded-[22px] border border-appBorder dark:border-appDarkBorder px-4 h-[56px] flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="再次输入新密码"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="flex-1 ml-2 h-full text-[14px] font-semibold text-appText dark:text-appDarkText"
              placeholderTextColor={isDarkMode ? '#a8a29e' : '#a8a29e'}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.85} className="w-10 h-full items-center justify-center -mr-2">
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={isDarkMode ? '#a8a29e' : '#78716c'} />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text className="text-[12px] font-semibold text-red-500">
              {error}
            </Text>
          ) : null}
        </View>

        <View className="mt-6">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.9}
            className={`py-4 rounded-[22px] items-center ${canSubmit ? 'bg-appText dark:bg-appDarkText' : 'bg-appBorder dark:bg-appDarkBorder'}`}
          >
            <Text className={`text-[14px] font-extrabold ${canSubmit ? 'text-white dark:text-appText' : 'text-appMuted dark:text-appDarkMuted'}`}>
              重置密码
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
