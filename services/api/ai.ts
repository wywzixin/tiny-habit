import { apiClient, ApiResponse } from './client';

/**
 * AI 推荐微行为请求参数
 */
export interface RecommendMicroBehaviorsRequest {
  habitName: string;
  habitCategory?: string;
  userContext?: string;
  refresh?: boolean;
  excludeBehaviors?: string[];
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
  anchor_suggestions?: string[];
}

/**
 * AI 推荐锚点请求参数
 */
export interface RecommendAnchorsRequest {
  habitName: string;
  timeOfDay?: string;
  userContext?: string;
  refresh?: boolean;
  excludeAnchors?: string[];
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

export interface RecommendCombinedRequest {
  habitName: string;
  habitCategory?: string;
  timeOfDay?: string;
  userContext?: string;
  maxItems?: number;
  refresh?: boolean;
  excludeBehaviors?: string[];
  excludeAnchors?: string[];
}

export interface CombinedRecommendResponse {
  micro_behaviors: RecommendedMicroBehavior[];
  anchors: RecommendedAnchor[];
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

/**
 * 合并推荐（微行为 + 锚点）
 * POST /api/ai/recommend
 * 需要认证
 */
export const recommendCombined = async (
  data: RecommendCombinedRequest
): Promise<CombinedRecommendResponse> => {
  const response = await apiClient.post<ApiResponse<string>>(
    '/api/ai/recommend',
    data,
    {
      timeout: 60000,
    }
  );
  return JSON.parse(response.data.data);
};
