import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MicroBehavior, CheckIn } from '../types';

/**
 * 游客模式数据存储
 * 用于未登录用户的本地数据管理
 * 登录后需要同步到服务器
 */
interface GuestState {
  // 游客模式的微行为数据
  microBehaviors: MicroBehavior[];
  checkIns: CheckIn[];
  todayCheckIns: string[]; // 今日已打卡的微行为 ID
  
  // Actions
  addMicroBehavior: (behavior: Omit<MicroBehavior, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMicroBehavior: (id: string, updates: Partial<MicroBehavior>) => void;
  deleteMicroBehavior: (id: string) => void;
  checkIn: (microBehaviorId: string, habitId: string) => void;
  uncheckIn: (microBehaviorId: string) => void;
  
  // 数据同步相关
  getAllData: () => { microBehaviors: MicroBehavior[]; checkIns: CheckIn[] };
  clearAllData: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      microBehaviors: [],
      checkIns: [],
      todayCheckIns: [],
      
      addMicroBehavior: (behavior) => {
        const newBehavior: MicroBehavior = {
          ...behavior,
          id: `guest-${Date.now()}`,
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
          id: `guest-checkin-${Date.now()}`,
          microBehaviorId,
          habitId,
          userId: 'guest',
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
      
      // 获取所有游客数据（用于同步）
      getAllData: () => {
        const state = get();
        return {
          microBehaviors: state.microBehaviors,
          checkIns: state.checkIns,
        };
      },
      
      // 清空所有游客数据（同步成功后调用）
      clearAllData: () => {
        set({
          microBehaviors: [],
          checkIns: [],
          todayCheckIns: [],
        });
      },
    }),
    {
      name: 'guest-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * TODO: 游客模式同步逻辑（最后实现）
 * 
 * 同步流程：
 * 1. 用户登录成功后，检查是否有游客数据
 * 2. 如果有，调用批量创建接口上传到服务器
 * 3. 上传成功后，清空游客数据
 * 4. 刷新 React Query 缓存
 * 
 * 示例代码：
 * ```typescript
 * export const syncGuestDataToServer = async () => {
 *   const guestData = useGuestStore.getState().getAllData();
 *   
 *   if (guestData.microBehaviors.length === 0) {
 *     return; // 没有数据需要同步
 *   }
 *   
 *   try {
 *     // 批量创建微行为
 *     await api.batchCreateMicroBehaviors(guestData.microBehaviors);
 *     
 *     // 批量创建打卡记录
 *     await api.batchCreateCheckIns(guestData.checkIns);
 *     
 *     // 清空游客数据
 *     useGuestStore.getState().clearAllData();
 *     
 *     // 刷新缓存
 *     await queryClient.invalidateQueries();
 *     
 *     return { success: true };
 *   } catch (error) {
 *     console.error('同步游客数据失败:', error);
 *     return { success: false, error };
 *   }
 * };
 * ```
 */
