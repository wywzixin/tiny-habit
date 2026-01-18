import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores';
import { queryClient } from '../services/api';

export default function RootLayout() {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const { setColorScheme } = useColorScheme();

  // 同步深色模式状态到NativeWind
  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setColorScheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <View className={`flex-1 ${isDarkMode ? 'dark' : ''}`}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create" options={{ presentation: 'modal' }} />
          <Stack.Screen name="detail/[id]" />
          <Stack.Screen name="edit/[id]" />
          <Stack.Screen name="rewards" />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
