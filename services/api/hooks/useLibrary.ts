import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys, queryClient } from '../queryClient';
import { useAuthStore } from '../../../stores/authStore';
import * as libraryApi from '../library';

/**
 * 获取习惯模板库 Hook
 */
export const useHabitTemplates = (category?: string) => {
  return useQuery({
    queryKey: queryKeys.habitTemplates(category),
    queryFn: () => libraryApi.getHabitTemplates(category),
  });
};

/**
 * 获取配方模板库 Hook
 */
export const useRecipeTemplates = (category?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.recipeTemplates(category),
    queryFn: () => libraryApi.getRecipeTemplates(category),
    enabled: options?.enabled !== false, // 默认启用，除非明确设置为 false
  });
};

/**
 * 从模板添加微行为 Hook
 */
export const useAddFromTemplate = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: libraryApi.addMicroBehaviorFromTemplate,
    onSuccess: () => {
      // 刷新微行为列表
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userMicroBehaviors(user.id.toString()),
        });
        // 刷新所有配方模板列表（更新 isAdded 状态）
        queryClient.invalidateQueries({
          queryKey: ['recipeTemplates'], // 使用前缀匹配，刷新所有分类
        });
      }
    },
    onError: (error: any) => {
      console.error('从模板添加微行为失败:', error);
    },
  });
};
