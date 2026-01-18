import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MicroBehavior, CheckIn } from '../types';
import { getTodayBackendDay } from '../utils/dateHelper';

type UserHabitTemplate = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  iconBg: string;
  createdAt: string;
};

interface HabitState {
  microBehaviors: MicroBehavior[];
  checkIns: CheckIn[];
  todayCheckIns: string[];
  userHabitTemplates: UserHabitTemplate[];

  // Actions
  addMicroBehavior: (behavior: Omit<MicroBehavior, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMicroBehavior: (id: string, updates: Partial<MicroBehavior>) => void;
  deleteMicroBehavior: (id: string) => void;
  checkIn: (microBehaviorId: string, habitId: string) => void;
  uncheckIn: (microBehaviorId: string) => void;
  isCheckedToday: (microBehaviorId: string) => boolean;
  getTodayBehaviors: () => MicroBehavior[];
  resetToSample: () => void;
  addUserHabitTemplate: (name: string) => void;
  deleteUserHabitTemplate: (id: string) => void;
}

// 示例数据 - 确保每天都能显示
const sampleMicroBehaviors: MicroBehavior[] = [
  {
    id: 'sample-1',
    habitId: 'habit-1',
    name: '喝一口水',
    icon: '💧',
    anchor: '起床后',
    behavior: '喝一口水',
    celebration: '说"太棒了"',
    difficulty: 'easy',
    frequency: [1, 2, 3, 4, 5, 6, 7], // 1-7 代表周一到周日
    reminderEnabled: false,
    sortOrder: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      microBehaviors: sampleMicroBehaviors,
      checkIns: [],
      todayCheckIns: [],
      userHabitTemplates: [],

      addMicroBehavior: (behavior) => {
        const newBehavior: MicroBehavior = {
          ...behavior,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          microBehaviors: [...state.microBehaviors, newBehavior],
        }));
      },

      updateMicroBehavior: (id, updates) => {
        set((state) => ({
          microBehaviors: state.microBehaviors.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      deleteMicroBehavior: (id) => {
        set((state) => ({
          microBehaviors: state.microBehaviors.filter((b) => b.id !== id),
        }));
      },

      checkIn: (microBehaviorId, habitId) => {
        const checkIn: CheckIn = {
          id: Date.now().toString(),
          microBehaviorId,
          habitId,
          userId: '1',
          checkedAt: new Date().toISOString(),
          pointsEarned: 10,
        };
        set((state) => ({
          checkIns: [...state.checkIns, checkIn],
          todayCheckIns: [...state.todayCheckIns, microBehaviorId],
        }));
      },

      uncheckIn: (microBehaviorId) => {
        set((state) => ({
          todayCheckIns: state.todayCheckIns.filter((id) => id !== microBehaviorId),
        }));
      },

      isCheckedToday: (microBehaviorId) => {
        return get().todayCheckIns.includes(microBehaviorId);
      },

      getTodayBehaviors: () => {
        const today = getTodayBackendDay(); // 使用工具函数获取后端格式的今天
        return get().microBehaviors.filter(
          (b) => b.isActive && b.frequency.includes(today)
        );
      },

      resetToSample: () => {
        set({ microBehaviors: sampleMicroBehaviors, checkIns: [], todayCheckIns: [] });
      },

      addUserHabitTemplate: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const exists = get().userHabitTemplates.some(
          (h) => h.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return;

        const iconBgPalette = ['#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3', '#CFFAFE', '#EDE9FE'];
        const nextBg = iconBgPalette[get().userHabitTemplates.length % iconBgPalette.length];

        const newHabit: UserHabitTemplate = {
          id: Date.now().toString(),
          name: trimmed,
          desc: '我创建的习惯',
          icon: '✨',
          iconBg: nextBg,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          userHabitTemplates: [newHabit, ...state.userHabitTemplates],
        }));
      },

      deleteUserHabitTemplate: (id) => {
        set((state) => ({
          userHabitTemplates: state.userHabitTemplates.filter((h) => h.id !== id),
        }));
      },
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 每次启动时重置为示例数据，方便测试
      skipHydration: false,
      merge: (persistedState: any, currentState) => {
        const persisted = persistedState as HabitState;
        // 如果持久化数据为空或无效，使用示例数据
        const hasBehaviors = persisted?.microBehaviors && Array.isArray(persisted.microBehaviors) && persisted.microBehaviors.length > 0;
        return {
          ...currentState,
          ...persisted,
          microBehaviors: hasBehaviors ? persisted.microBehaviors : sampleMicroBehaviors,
          todayCheckIns: persisted?.todayCheckIns || [],
          checkIns: persisted?.checkIns || [],
          userHabitTemplates: persisted?.userHabitTemplates || [],
        };
      },
    }
  )
);
