import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reward } from '../types';

interface RewardState {
  rewards: Reward[];
  addReward: (reward: Omit<Reward, 'id' | 'status' | 'createdAt'>) => void;
  redeemReward: (id: string) => void;
  deleteReward: (id: string) => void;
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set) => ({
      rewards: [],

      addReward: (reward) => {
        const newReward: Reward = {
          ...reward,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          rewards: [...state.rewards, newReward],
        }));
      },

      redeemReward: (id) => {
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.id === id
              ? { ...r, status: 'redeemed' as const, redeemedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      deleteReward: (id) => {
        set((state) => ({
          rewards: state.rewards.filter((r) => r.id !== id),
        }));
      },
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
