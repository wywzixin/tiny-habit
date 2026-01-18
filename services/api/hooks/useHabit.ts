import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import { queryClient, queryKeys } from '../queryClient';
import * as habitApi from '../habit';
import { frequencyUtils } from '../client';

/**
 * 获取用户的微行为列表
 */
export const useUserMicroBehaviors = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.userMicroBehaviors(userId?.toString() || ''),
    queryFn: () => habitApi.getUserMicroBehaviors(userId!),
    enabled: !!userId,
    select: (data) => {
      // 转换后端数据为前端格式
      return data.map((item) => ({
        id: item.id.toString(),
        habitId: item.habitId?.toString() || '',
        name: item.name,
        icon: item.icon,
        anchor: item.anchor,
        behavior: item.behavior,
        celebration: item.celebration,
        difficulty: item.difficulty,
        frequency: frequencyUtils.deserialize(item.frequency), // 转换为 number[]
        reminderEnabled: item.reminderEnabled,
        reminderTime: item.reminderTime,
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
    },
  });
};

/**
 * 创建配方
 */
export const useCreateRecipe = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: habitApi.createRecipe,
    onSuccess: () => {
      // 刷新微行为列表和习惯库
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userMicroBehaviors(user.id.toString()),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.habitLibrary,
        });
      }
    },
    onError: (error: any) => {
      console.error('创建配方失败 - 详细信息:', error);
    },
    meta: {
      getErrorMessage: (error: any) => {
        if (error.code === 0) {
          return '网络连接失败，请检查网络';
        } else if (error.message?.includes('数据库') || error.message?.includes('SQL')) {
          return '服务器错误，请稍后重试';
        }
        return '创建失败，请稍后重试';
      },
    },
  });
};

/**
 * 获取习惯库
 */
export const useHabitLibrary = (category?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.habitLibrary, category],
    queryFn: () => habitApi.getHabitLibrary(category),
    enabled: options?.enabled !== false, // 默认启用，除非明确设置为 false
  });
};

/**
 * 删除习惯
 */
export const useDeleteHabit = () => {
  return useMutation({
    mutationFn: habitApi.deleteHabit,
    onSuccess: () => {
      // 刷新习惯库
      queryClient.invalidateQueries({
        queryKey: queryKeys.habitLibrary,
      });
    },
    onError: (error: any) => {
      console.error('删除习惯失败:', error);
    },
  });
};

/**
 * 更新配方
 */
export const useUpdateRecipe = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: habitApi.updateRecipe,
    onSuccess: (_, variables) => {
      // 刷新微行为列表、详情和习惯库
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userMicroBehaviors(user.id.toString()),
        });
        queryClient.invalidateQueries({
          queryKey: ['microBehavior', variables.microBehaviorId.toString()],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.habitLibrary,
        });
      }
    },
    onError: (error: any) => {
      console.error('更新配方失败:', error);
    },
  });
};
