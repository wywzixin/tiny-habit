import { apiClient, ApiResponse } from './client';

/**
 * AI 推荐微行为请求参数
 */
export interface RecommendMicroBehaviorsRequest {
  habitName: string;
  habitCategory?: string;
  userContext?: string;
}

/**
 * AI 推荐微行为返回项
 */
export interface RecommendedMicroBehavior {
  name: string;
  behavior: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  estimatedTime?: string; // 预计完成时间，如 "30分钟"、"5分钟"
}

/**
 * AI 推荐锚点请求参数
 */
export interface RecommendAnchorsRequest {
  habitName: string;
  timeOfDay?: string;
  userContext?: string;
}

/**
 * AI 推荐锚点返回项
 */
export interface RecommendedAnchor {
  anchor: string;
  description: string;
  timeOfDay: string;
  icon: string;
}

/**
 * 推荐微行为
 * POST /api/ai/recommend/micro-behaviors
 * 无需认证
 */
export const recommendMicroBehaviors = async (
  data: RecommendMicroBehaviorsRequest
): Promise<RecommendedMicroBehavior[]> => {
  const response = await apiClient.post<ApiResponse<string>>(
    '/api/ai/recommend/micro-behaviors',
    data,
    {
      timeout: 60000, // AI 接口需要较长时间，设置 60 秒超时
    }
  );
  // 返回的 data 是 JSON 字符串，需要解析
  return JSON.parse(response.data.data);
};

/**
 * 推荐锚点
 * POST /api/ai/recommend/anchors
 * 无需认证
 */
export const recommendAnchors = async (
  data: RecommendAnchorsRequest
): Promise<RecommendedAnchor[]> => {
  const response = await apiClient.post<ApiResponse<string>>(
    '/api/ai/recommend/anchors',
    data,
    {
      timeout: 60000, // AI 接口需要较长时间，设置 60 秒超时
    }
  );
  // 返回的 data 是 JSON 字符串，需要解析
  return JSON.parse(response.data.data);
};
