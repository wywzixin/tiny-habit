import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import { queryClient, queryKeys } from '../queryClient';
import * as rewardApi from '../reward';

/**
 * 获取用户奖励列表
 */
export const useUserRewards = (userId?: number) => {
  return useQuery({
    queryKey: queryKeys.rewards(userId?.toString() || ''),
    queryFn: () => rewardApi.getUserRewards(userId!),
    enabled: !!userId,
  });
};

/**
 * 创建奖励
 */
export const useCreateReward = () => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: rewardApi.createReward,
    onSuccess: () => {
      // 刷新奖励列表
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rewards(user.id.toString()),
        });
      }
    },
    onError: (error: any) => {
      console.error('创建奖励失败:', error);
    },
  });
};

/**
 * 兑换奖励
 */
export const useRedeemReward = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: ({ rewardId, cost }: { rewardId: number; cost: number }) =>
      rewardApi.redeemReward(rewardId),
    onSuccess: (_, variables) => {
      // 更新用户可用积分（扣除兑换消耗的积分）
      if (user) {
        updateUser({
          availablePoints: user.availablePoints - variables.cost,
        });
      }

      // 刷新奖励列表
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rewards(user.id.toString()),
        });
        // 刷新统计数据
        queryClient.invalidateQueries({
          queryKey: queryKeys.userStats(user.id.toString()),
        });
      }
    },
    onError: (error: any) => {
      console.error('兑换奖励失败:', error);
    },
  });
};
