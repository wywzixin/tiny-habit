import { apiClient, ApiResponse } from './client';

/**
 * 打卡记录类型
 */
export interface CheckInRecord {
  id: number;
  microBehaviorId: number;
  habitId: number;
  userId: number;
  checkedAt: string;
  pointsEarned: number;
}

/**
 * 打卡请求参数
 */
export interface CheckInRequest {
  microBehaviorId: number;
  habitId: number;
}

/**
 * 打卡
 * POST /api/checkin
 */
export const checkIn = async (data: CheckInRequest): Promise<CheckInRecord> => {
  const response = await apiClient.post<ApiResponse<CheckInRecord>>(
    '/api/checkin',
    data
  );
  return response.data.data;
};

/**
 * 获取用户打卡记录
 * GET /api/checkin/user/{userId}
 */
export const getUserCheckIns = async (userId: number): Promise<CheckInRecord[]> => {
  const response = await apiClient.get<ApiResponse<CheckInRecord[]>>(
    `/api/checkin/user/${userId}`
  );
  return response.data.data;
};

/**
 * 获取今日打卡记录
 * GET /api/checkin/today/{userId}
 */
export const getTodayCheckIns = async (userId: number): Promise<CheckInRecord[]> => {
  const response = await apiClient.get<ApiResponse<CheckInRecord[]>>(
    `/api/checkin/today/${userId}`
  );
  return response.data.data;
};
