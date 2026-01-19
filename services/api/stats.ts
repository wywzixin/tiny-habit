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
  console.log('今日打卡接口原始响应:', response.data);
  const rawData: any = response.data.data;
  const list = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.list)
      ? rawData.list
      : Array.isArray(rawData?.records)
        ? rawData.records
        : [];

  const clean = (value: any) => (typeof value === 'string' ? value.trim() : value);

  return list.map((item: any) => {
    const icon =
      clean(item.icon) ??
      clean(item.microBehaviorIcon) ??
      clean(item.behaviorIcon) ??
      clean(item.habitIcon) ??
      '✨';

    const behavior =
      clean(item.behavior) ||
      clean(item.microBehavior) ||
      clean(item.microBehaviorName) ||
      clean(item.name) ||
      clean(item.habitName) ||
      '已完成';

    const celebration =
      clean(item.celebration) ||
      clean(item.celebrate) ||
      clean(item.celebrationText) ||
      '';

    const checkedAt =
      item.checkedAt ?? item.checkInTime ?? item.createdAt ?? item.time ?? new Date().toISOString();

    const pointsEarned = item.pointsEarned ?? item.points ?? item.score ?? 0;

    return {
      icon,
      behavior,
      celebration,
      checkedAt,
      pointsEarned,
    };
  });
};
