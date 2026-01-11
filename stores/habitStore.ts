import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MicroBehavior, CheckIn } from '../types';

interface HabitState {
  microBehaviors: MicroBehavior[];
  checkIns: CheckIn[];
  todayCheckIns: string[];

  // Actions
  addMicroBehavior: (behavior: Omit<MicroBehavior, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMicroBehavior: (id: string, updates: Partial<MicroBehavior>) => void;
  deleteMicroBehavior: (id: string) => void;
  checkIn: (microBehaviorId: string, habitId: string) => void;
  uncheckIn: (microBehaviorId: string) => void;
  isCheckedToday: (microBehaviorId: string) => boolean;
  getTodayBehaviors: () => MicroBehavior[];
  resetToSample: () => void;
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
    frequency: [0, 1, 2, 3, 4, 5, 6], // 每天
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
          pointsEarned: 1,
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
        const today = new Date().getDay();
        return get().microBehaviors.filter(
          (b) => b.isActive && b.frequency.includes(today)
        );
      },

      resetToSample: () => {
        set({ microBehaviors: sampleMicroBehaviors, checkIns: [], todayCheckIns: [] });
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
        };
      },
    }
  )
);
