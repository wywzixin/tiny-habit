import { apiClient, ApiResponse } from './client';

/**
 * 奖励类型
 */
export interface Reward {
  id: number;
  userId: number;
  name: string;
  icon: string;
  cost: number;
  status: 'pending' | 'redeemed';
  redeemedAt?: string;
  createdAt: string;
}

/**
 * 创建奖励请求参数
 */
export interface CreateRewardRequest {
  userId: number;
  name: string;
  icon: string;
  cost: number;
}

/**
 * 创建奖励
 * POST /api/reward
 */
export const createReward = async (data: CreateRewardRequest): Promise<Reward> => {
  const response = await apiClient.post<ApiResponse<Reward>>('/api/reward', data);
  return response.data.data;
};

/**
 * 获取用户奖励列表
 * GET /api/reward/user/{userId}
 */
export const getUserRewards = async (userId: number): Promise<Reward[]> => {
  const response = await apiClient.get<ApiResponse<Reward[]>>(
    `/api/reward/user/${userId}`
  );
  return response.data.data;
};

/**
 * 兑换奖励
 * POST /api/reward/{id}/redeem
 * 注意：userId 从 token 自动获取，无需传递
 */
export const redeemReward = async (rewardId: number): Promise<Reward> => {
  const response = await apiClient.post<ApiResponse<Reward>>(
    `/api/reward/${rewardId}/redeem`
  );
  return response.data.data;
};
