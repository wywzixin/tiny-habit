import { apiClient, ApiResponse } from './client';

// 习惯模板类型
export interface HabitTemplate {
  id: number;
  sourceHabitId: number | null;
  sourceUserId: number | null;
  category: string;
  name: string;
  icon: string;
  description: string;
  suggestedAnchors: string; // JSON 字符串
  suggestedBehaviors: string; // JSON 字符串
  suggestedCelebrations: string; // JSON 字符串
  difficulty: 'easy' | 'medium' | 'hard';
  isSystem: boolean;
  popularity: number;
  createdAt: string;
}

// 配方模板类型
export interface RecipeTemplate {
  id: number;
  category: string;
  name: string;
  icon: string;
  anchor: string;
  behavior: string;
  celebration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isSystem: boolean;
  popularity: number;
  isAdded: boolean; // 是否已添加（后端返回）
}

/**
 * 获取习惯库列表（无需认证）
 * GET /api/library/habits
 */
export const getHabitTemplates = async (category?: string): Promise<HabitTemplate[]> => {
  const params = category ? { category } : {};
  const response = await apiClient.get<ApiResponse<HabitTemplate[]>>(
    '/api/library/habits',
    { params }
  );
  return response.data.data;
};

/**
 * 获取配方模板列表（无需认证）
 * GET /api/library/recipes
 */
export const getRecipeTemplates = async (category?: string): Promise<RecipeTemplate[]> => {
  const params = category ? { category } : {};
  const response = await apiClient.get<ApiResponse<RecipeTemplate[]>>(
    '/api/library/recipes',
    { params }
  );
  return response.data.data;
};

/**
 * 从模板添加微行为请求参数
 */
export interface AddFromTemplateRequest {
  templateId: number;
  frequency?: number[]; // 前端使用 number[]
  reminderEnabled?: boolean;
  reminderTime?: string;
}

/**
 * 从模板添加微行为响应
 */
export interface AddFromTemplateResponse {
  id: number;
  habitId: number | null;
  userId: number;
  name: string;
  icon: string;
  anchor: string;
  behavior: string;
  celebration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: string; // 后端返回 JSON 字符串
  reminderEnabled: boolean;
  reminderTime: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * 从配方模板添加微行为
 * POST /api/micro-behavior/add-from-template
 */
export const addMicroBehaviorFromTemplate = async (
  data: AddFromTemplateRequest
): Promise<AddFromTemplateResponse> => {
  // 转换 frequency 为后端格式
  const requestData = {
    templateId: data.templateId,
    frequency: data.frequency 
      ? JSON.stringify(data.frequency) 
      : "[1,2,3,4,5,6,7]",
    reminderEnabled: data.reminderEnabled ?? false,
    reminderTime: data.reminderTime ?? null,
  };

  const response = await apiClient.post<ApiResponse<AddFromTemplateResponse>>(
    '/api/micro-behavior/add-from-template',
    requestData
  );
  return response.data.data;
};
