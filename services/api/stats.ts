import { apiClient, ApiResponse } from './client';

/**
 * 用户统计数据类型
 */
export interface UserStats {
  totalPoints: number;          // 总积分
  availablePoints: number;      // 可用积分
  level: number;                // 用户等级
  habitCount: number;           // 习惯数量
  microBehaviorCount: number;   // 微行为数量
  checkInCount: number;         // 打卡次数
}

/**
 * 今日打卡记录类型（发光时刻）
 */
export interface TodayCheckIn {
  icon: string;                 // 微行为图标
  behavior: string;             // 行为描述
  celebration: string;          // 庆祝方式
  checkedAt: string;            // 打卡时间（ISO8601 格式）
  pointsEarned: number;         // 本次打卡获得的积分
}

/**
 * 获取用户统计数据
 * GET /api/stats/user/{userId}
 */
export const getUserStats = async (userId: number): Promise<UserStats> => {
  const response = await apiClient.get<ApiResponse<UserStats>>(
    `/api/stats/user/${userId}`
  );
  return response.data.data;
};

/**
 * 获取今日打卡数据（发光时刻）
 * GET /api/stats/today-checkins/{userId}
 */
export const getTodayCheckIns = async (userId: number): Promise<TodayCheckIn[]> => {
  const response = await apiClient.get<ApiResponse<TodayCheckIn[]>>(
    `/api/stats/today-checkins/${userId}`
  );
  console.log('今日打卡原始响应:', response.data);
  console.log('今日打卡数据:', response.data.data);
  console.log('第一条数据:', response.data.data?.[0]);
  return response.data.data;
};
