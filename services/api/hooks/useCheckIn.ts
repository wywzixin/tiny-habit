import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import { queryClient, queryKeys } from '../queryClient';
import * as checkinApi from '../checkin';

/**
 * 打卡 mutation
 */
export const useCheckIn = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: checkinApi.checkIn,
    onSuccess: (data) => {
      // 更新用户积分（打卡获得 10 积分）
      if (user) {
        updateUser({
          totalPoints: user.totalPoints + (data.pointsEarned || 10),
          availablePoints: user.availablePoints + (data.pointsEarned || 10),
        });
      }

      // 刷新打卡记录和微行为列表
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.checkIns(user.id.toString()),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.todayCheckIns(user.id.toString()),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.userMicroBehaviors(user.id.toString()),
        });
        // 刷新统计数据
        queryClient.invalidateQueries({
          queryKey: queryKeys.userStats(user.id.toString()),
        });
      }
    },
    onError: (error: any) => {
      console.error('打卡失败:', error);
    },
  });
};

/**
 * 获取用户打卡记录
 */
export const useUserCheckIns = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.checkIns(userId?.toString() || ''),
    queryFn: () => checkinApi.getUserCheckIns(userId!),
    enabled: !!userId,
  });
};

/**
 * 获取今日打卡记录
 */
export const useTodayCheckIns = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.todayCheckIns(userId?.toString() || ''),
    queryFn: () => checkinApi.getTodayCheckIns(userId!),
    enabled: !!userId,
  });
};
