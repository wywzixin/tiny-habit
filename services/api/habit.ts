import { apiClient, ApiResponse, frequencyUtils } from './client';

/**
 * 微行为响应类型
 */
export interface MicroBehaviorResponse {
  id: number;
  habitId: number | null;
  habitName?: string;
  habitIcon?: string;
  userId: number;
  name: string;
  icon: string;
  anchor: string;
  behavior: string;
  celebration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: string; // 后端返回 JSON 字符串
  reminderEnabled: boolean;
  reminderTime?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 创建配方请求参数
 */
export interface CreateRecipeRequest {
  habitId?: number | null;
  habitName?: string;
  habitIcon?: string;
  habitCategory?: string;
  habitDescription?: string;
  microBehavior: {
    name: string;
    icon: string;
    anchor: string;
    behavior: string;
    celebration: string;
    difficulty: 'easy' | 'medium' | 'hard';
    frequency: number[]; // 前端使用 number[]
    reminderEnabled: boolean;
    reminderTime?: string;
  };
}

/**
 * 创建配方响应
 */
export interface CreateRecipeResponse {
  habit: {
    id: number;
    name: string;
    icon: string;
    category: string;
    isNew: boolean;
  };
  microBehavior: MicroBehaviorResponse;
}

/**
 * 习惯库项目类型
 */
export interface HabitLibraryItem {
  id: number;
  name: string;
  icon: string;
  category: string;
  source: 'user' | 'system';
  microBehaviorCount?: number;
  description?: string;
  popularity?: number;
}

/**
 * 获取用户的微行为列表
 * GET /api/habit/user/{userId}/micro-behaviors
 */
export const getUserMicroBehaviors = async (userId: number): Promise<MicroBehaviorResponse[]> => {
  const response = await apiClient.get<ApiResponse<MicroBehaviorResponse[]>>(
    `/api/habit/user/${userId}/micro-behaviors`
  );
  return response.data.data;
};

/**
 * 创建配方（习惯 + 微行为）
 * POST /api/recipe/create
 */
export const createRecipe = async (data: CreateRecipeRequest): Promise<CreateRecipeResponse> => {
  // 转换 frequency 为后端格式
  const requestData = {
    ...data,
    microBehavior: {
      ...data.microBehavior,
      frequency: frequencyUtils.serialize(data.microBehavior.frequency),
    },
  };

  const response = await apiClient.post<ApiResponse<CreateRecipeResponse>>(
    '/api/recipe/create',
    requestData
  );
  return response.data.data;
};

/**
 * 获取习惯库（用户习惯 + 系统习惯）
 * GET /api/habit/library
 */
export const getHabitLibrary = async (category?: string): Promise<HabitLibraryItem[]> => {
  const response = await apiClient.get<ApiResponse<HabitLibraryItem[]>>(
    '/api/habit/library',
    { params: category ? { category } : undefined }
  );
  return response.data.data;
};

/**
 * 删除习惯
 * DELETE /api/habit/{id}
 */
export const deleteHabit = async (habitId: number): Promise<void> => {
  await apiClient.delete(`/api/habit/${habitId}`);
};

/**
 * 更新配方请求参数
 */
export interface UpdateRecipeRequest {
  microBehaviorId: number;
  habitName?: string;
  habitIcon?: string;
  habitCategory?: string;
  habitDescription?: string;
  microBehavior: {
    name: string;
    icon: string;
    anchor: string;
    behavior: string;
    celebration: string;
    difficulty: 'easy' | 'medium' | 'hard';
    frequency: number[]; // 前端使用 number[]
    reminderEnabled: boolean;
    reminderTime?: string;
  };
}

/**
 * 更新配方
 * PUT /api/recipe/update
 */
export const updateRecipe = async (data: UpdateRecipeRequest): Promise<CreateRecipeResponse> => {
  // 转换 frequency 为后端格式
  const requestData = {
    ...data,
    microBehavior: {
      ...data.microBehavior,
      frequency: frequencyUtils.serialize(data.microBehavior.frequency),
    },
  };

  const response = await apiClient.put<ApiResponse<CreateRecipeResponse>>(
    '/api/recipe/update',
    requestData
  );
  return response.data.data;
};

/**
 * 获取微行为详情
 * GET /api/micro-behavior/{id}
 */
export const getMicroBehaviorById = async (id: number): Promise<MicroBehaviorResponse> => {
  const response = await apiClient.get<ApiResponse<MicroBehaviorResponse>>(
    `/api/micro-behavior/${id}`
  );
  return response.data.data;
};

/**
 * 删除微行为
 * DELETE /api/micro-behavior/{id}
 */
export const deleteMicroBehavior = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/micro-behavior/${id}`);
};
