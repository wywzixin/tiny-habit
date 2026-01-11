import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  isDarkMode: boolean;

  addPoints: (points: number) => void;
  redeemPoints: (points: number) => boolean;
  toggleDarkMode: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      isDarkMode: false,

      addPoints: (points) => {
        set((state) => ({
          totalPoints: state.totalPoints + points,
          availablePoints: state.availablePoints + points,
        }));
      },

      redeemPoints: (points) => {
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
