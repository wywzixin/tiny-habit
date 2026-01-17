import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthProvider = 'phone' | 'password' | 'wechat' | 'apple' | 'qq' | 'weibo';

interface AuthUser {
  id: string;
  displayName: string;
  identifier?: string;
  phone?: string;
  email?: string;
  avatarUri?: string;
  gender?: 'male' | 'female' | 'unknown';
  provider: AuthProvider;
}

interface UserState {
  isLoggedIn: boolean;
  user: AuthUser | null;

  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  isDarkMode: boolean;

  passwordByIdentifier: Record<string, string>;

  loginWithPhoneCode: (phone: string) => void;
  loginWithPassword: (emailOrPhone: string, password: string) => boolean;
  loginWithWeChat: () => void;
  loginWithApple: () => void;
  loginWithQQ: () => void;
  loginWithWeibo: () => void;
  logout: () => void;
  registerWithPassword: (emailOrPhone: string, password: string) => void;
  resetPassword: (emailOrPhone: string, newPassword: string) => void;
  updateProfile: (updates: Partial<Pick<AuthUser, 'displayName' | 'avatarUri' | 'gender'>>) => void;

  addPoints: (points: number) => void;
  redeemPoints: (points: number) => boolean;
  toggleDarkMode: () => void;
}

function normalizeIdentifier(raw: string) {
  const v = raw.trim();
  if (v.includes('@')) return v.toLowerCase();
  return v.replace(/\s+/g, '');
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,

      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      isDarkMode: false,

      passwordByIdentifier: {},

      loginWithPhoneCode: (phone) => {
        const identifier = normalizeIdentifier(phone);
        set({
          isLoggedIn: true,
          user: {
            id: 'u-1',
            displayName: '用户',
            identifier,
            phone,
            provider: 'phone',
          },
        });
      },

      loginWithPassword: (emailOrPhone, password) => {
        const identifier = normalizeIdentifier(emailOrPhone);
        const savedPassword = get().passwordByIdentifier[identifier];
        if (savedPassword && savedPassword !== password) return false;

        const isEmail = identifier.includes('@');
        const isPhone = /^\d+$/.test(identifier);
        set({
          isLoggedIn: true,
          user: {
            id: 'u-1',
            displayName: '用户',
            identifier,
            phone: isPhone ? identifier : undefined,
            email: isEmail ? identifier : undefined,
            provider: 'password',
          },
        });
        return true;
      },

      loginWithWeChat: () => {
        set({
          isLoggedIn: true,
          user: {
            id: 'u-wx-1',
            displayName: '微信用户',
            provider: 'wechat',
          },
        });
      },

      loginWithApple: () => {
        set({
          isLoggedIn: true,
          user: {
            id: 'u-ap-1',
            displayName: 'Apple 用户',
            provider: 'apple',
          },
        });
      },

      loginWithQQ: () => {
        set({
          isLoggedIn: true,
          user: {
            id: 'u-qq-1',
            displayName: 'QQ 用户',
            provider: 'qq',
          },
        });
      },

      loginWithWeibo: () => {
        set({
          isLoggedIn: true,
          user: {
            id: 'u-wb-1',
            displayName: '微博用户',
            provider: 'weibo',
          },
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
        });
      },

      registerWithPassword: (emailOrPhone, password) => {
        const identifier = normalizeIdentifier(emailOrPhone);
        const isEmail = identifier.includes('@');
        const isPhone = /^\d+$/.test(identifier);
        set({
          isLoggedIn: true,
          passwordByIdentifier: {
            ...get().passwordByIdentifier,
            [identifier]: password,
          },
          user: {
            id: 'u-1',
            displayName: '用户',
            identifier,
            phone: isPhone ? identifier : undefined,
            email: isEmail ? identifier : undefined,
            provider: 'password',
          },
        });
      },

      resetPassword: (emailOrPhone, newPassword) => {
        const identifier = normalizeIdentifier(emailOrPhone);
        set({
          passwordByIdentifier: {
            ...get().passwordByIdentifier,
            [identifier]: newPassword,
          },
        });
      },

      updateProfile: (updates) => {
        if (!get().isLoggedIn || !get().user) return;
        set({
          user: {
            ...get().user!,
            ...updates,
          },
        });
      },

      addPoints: (points) => {
        if (!get().isLoggedIn) return;
        set((state) => ({
          totalPoints: state.totalPoints + points,
          availablePoints: state.availablePoints + points,
        }));
      },

      redeemPoints: (points) => {
        if (!get().isLoggedIn) return false;
        const { availablePoints } = get();
        if (availablePoints >= points) {
          set((state) => ({
            availablePoints: state.availablePoints - points,
            redeemedPoints: state.redeemedPoints + points,
          }));
          return true;
        }
        return false;
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
