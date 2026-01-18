import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores';

export default function TabLayout() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
          height: 74,
          paddingTop: 10,
          paddingBottom: 12,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: isDarkMode ? '#17171C' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDarkMode ? '#2A2A33' : '#E7E5E4',
          shadowColor: '#000',
          shadowOpacity: isDarkMode ? 0.25 : 0.08,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 14 },
          elevation: 20,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: isDarkMode ? '#a8a29e' : '#78716c',
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-placeholder"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarItemStyle: {
            width: 72,
          },
          tabBarIcon: () => (
            <View style={{ marginTop: -28 }}>
              <TouchableOpacity
                onPress={() => router.push('/create')}
                activeOpacity={0.9}
                className="w-[58px] h-[58px] rounded-full items-center justify-center bg-appText dark:bg-appDarkText border-4 border-appBg dark:border-appDarkBg shadow-lg"
              >
                <Ionicons name="add" size={30} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/create');
          },
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '统计',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
