import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 用户信息类型
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  gender: 'male' | 'female' | 'unknown';
  level: number;
  totalPoints: number;
  availablePoints: number;
  createdAt?: string;
}

// 主题配色类型
export type ThemeColor = 'green' | 'blue' | 'purple' | 'orange' | 'pink';

// 主题配色方案
export const themeColors: Record<ThemeColor, { primary: string; primaryLight: string; name: string }> = {
  green: { primary: '#10B981', primaryLight: '#D1FAE5', name: '清新绿' },
  blue: { primary: '#3B82F6', primaryLight: '#DBEAFE', name: '天空蓝' },
  purple: { primary: '#8B5CF6', primaryLight: '#EDE9FE', name: '梦幻紫' },
  orange: { primary: '#F97316', primaryLight: '#FFEDD5', name: '活力橙' },
  pink: { primary: '#EC4899', primaryLight: '#FCE7F3', name: '浪漫粉' },
};

interface AuthState {
  // 认证状态
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;

  // UI 状态
  isDarkMode: boolean;
  language: 'zh' | 'en';
  themeColor: ThemeColor;
  notificationsEnabled: boolean;

  // Actions
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setLanguage: (language: 'zh' | 'en') => void;
  setThemeColor: (color: ThemeColor) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      isLoggedIn: false,
      token: null,
      user: null,
      isDarkMode: false,
      language: 'zh',
      themeColor: 'green',
      notificationsEnabled: true,

      // 设置认证信息（登录/注册成功后调用）
      setAuth: (token, user) => {
        set({
          isLoggedIn: true,
          token,
          user,
        });
      },

      // 清除认证信息（登出/Token 失效）
      clearAuth: () => {
        set({
          isLoggedIn: false,
          token: null,
          user: null,
        });
      },

      // 更新用户信息
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // 切换深色模式
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },
      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },
      setLanguage: (language) => {
        set({ language });
      },
      // 设置主题配色
      setThemeColor: (color) => {
        set({ themeColor: color });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState;
        return {
          ...persistedState,
          notificationsEnabled: true,
        };
      },
    }
  )
);
