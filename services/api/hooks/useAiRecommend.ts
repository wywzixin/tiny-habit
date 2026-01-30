import { useMutation } from '@tanstack/react-query';
import * as aiApi from '../ai';

/**
 * AI 推荐微行为 mutation
 */
export const useRecommendMicroBehaviors = () => {
  return useMutation({
    mutationFn: aiApi.recommendMicroBehaviors,
    onError: (error: any) => {
      console.error('AI 推荐微行为失败:', error);
    },
  });
};

/**
 * AI 推荐锚点 mutation
 */
export const useRecommendAnchors = () => {
  return useMutation({
    mutationFn: aiApi.recommendAnchors,
    onError: (error: any) => {
      console.error('AI 推荐锚点失败:', error);
    },
  });
};

/**
 * AI 合并推荐（微行为 + 锚点）
 */
export const useRecommendCombined = () => {
  return useMutation({
    mutationFn: aiApi.recommendCombined,
    onError: (error: any) => {
      console.error('AI 合并推荐失败:', error);
    },
  });
};
