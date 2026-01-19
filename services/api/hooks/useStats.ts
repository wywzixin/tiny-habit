import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryClient';
import * as statsApi from '../stats';

/**
 * 获取用户统计数据 Hook
 */
export const useUserStats = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.userStats(userId?.toString() || ''),
    queryFn: () => statsApi.getUserStats(userId!),
    enabled: !!userId,
  });
};

/**
 * 获取今日打卡数据（发光时刻）Hook
 */
export const useTodayCheckIns = (userId?: number) => {
  return useQuery({
    queryKey: [...queryKeys.userStats(userId?.toString() || ''), 'today-checkins-v2'],
    queryFn: () => statsApi.getTodayCheckIns(userId!),
    enabled: !!userId,
  });
};
