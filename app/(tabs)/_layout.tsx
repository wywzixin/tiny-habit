import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores';
import { themeColors } from '../../stores/authStore';
import { t } from '../../utils/i18n';

export default function TabLayout() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const language = useAuthStore((state) => state.language);
  const themeColor = useAuthStore((state) => state.themeColor);
  const currentTheme = themeColors[themeColor];
  const tabBarBg = isDarkMode ? 'rgba(23,23,28,0.92)' : 'rgba(255,255,255,0.94)';
  const tabBarBorder = isDarkMode ? 'rgba(72,72,85,0.55)' : 'rgba(231,229,228,0.85)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 14,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
          borderRadius: 26,
          borderTopWidth: 0,
          backgroundColor: tabBarBg,
          borderWidth: 1,
          borderColor: tabBarBorder,
          shadowColor: '#000',
          shadowOpacity: isDarkMode ? 0.2 : 0.1,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 14,
        },
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: isDarkMode ? '#a8a29e' : '#78716c',
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t(language, 'common.home'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t(language, 'common.discover'),
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
            width: 70,
          },
          tabBarIcon: () => (
            <View style={{ marginTop: -22 }}>
              <TouchableOpacity
                onPress={() => router.push('/create')}
                activeOpacity={0.9}
                style={{
                  shadowColor: '#000',
                  shadowOpacity: isDarkMode ? 0.25 : 0.18,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 10,
                }}
              >
                <LinearGradient
                  colors={[currentTheme.primary, currentTheme.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: tabBarBg,
                  }}
                >
                  <Ionicons name="add" size={28} color="#FFFFFF" />
                </LinearGradient>
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
          title: t(language, 'common.stats'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t(language, 'common.profile'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
