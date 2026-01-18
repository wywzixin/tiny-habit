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

interface AuthState {
  // 认证状态
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  
  // UI 状态
  isDarkMode: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  toggleDarkMode: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      isLoggedIn: false,
      token: null,
      user: null,
      isDarkMode: false,
      
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
