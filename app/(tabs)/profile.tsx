import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useUserStore();

  const menuItems = [
    { icon: 'gift', label: '奖励中心', route: '/rewards' },
    { icon: 'color-palette', label: '主题样式' },
    { icon: 'globe', label: '语言设置' },
    { icon: 'notifications', label: '通知提醒' },
    { icon: 'book', label: '关于福格模型' },
    { icon: 'chatbubble', label: '反馈建议' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-800">
      <View className="px-5 py-3">
        <Text className="text-xl font-bold text-stone-700 dark:text-stone-100">我的</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="bg-primary mx-5 p-5 rounded-[20px] mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-3xl">👤</Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-white">用户</Text>
              <Text className="text-sm text-white/80">Lv.1 新手</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="mx-5 bg-white dark:bg-stone-700 rounded-2xl border border-stone-200 dark:border-stone-600 overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => item.route && router.push(item.route as any)}
              className={`p-4 flex-row items-center justify-between ${
                index < menuItems.length - 1 ? 'border-b border-stone-100 dark:border-stone-600' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name={item.icon as any} size={20} color="#a8a29e" />
                <Text className="text-sm font-medium text-stone-700 dark:text-stone-200">{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#d6d3d1" />
            </TouchableOpacity>
          ))}

          {/* Dark Mode Toggle */}
          <View className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="moon" size={20} color="#a8a29e" />
              <Text className="text-sm font-medium text-stone-700 dark:text-stone-200">深色模式</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#e7e5e4', true: '#10B981' }}
            />
          </View>
        </View>

        <Text className="text-center text-[10px] text-stone-300 dark:text-stone-500 pb-8">
          Tiny Habits v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
