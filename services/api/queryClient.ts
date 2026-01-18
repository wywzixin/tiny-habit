import { QueryClient } from '@tanstack/react-query';

// React Query 配置
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // 失败重试 3 次
      staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
      gcTime: 10 * 60 * 1000, // 10 分钟后清理缓存 (原 cacheTime)
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
      refetchOnReconnect: true, // 网络重连时自动刷新
      networkMode: 'offlineFirst', // 离线优先模式
    },
    mutations: {
      retry: 1, // mutation 失败重试 1 次
      networkMode: 'offlineFirst',
    },
  },
});

// Query Keys 常量
export const queryKeys = {
  // 用户相关
  user: (userId: string) => ['user', userId] as const,
  userStats: (userId: string) => ['user', userId, 'stats'] as const,
  
  // 微行为相关
  microBehaviors: (userId: string) => ['microBehaviors', userId] as const,
  microBehavior: (id: string) => ['microBehavior', id] as const,
  todayBehaviors: (userId: string) => ['todayBehaviors', userId] as const,
  
  // 打卡相关
  checkIns: (userId: string) => ['checkIns', userId] as const,
  todayCheckIns: (userId: string) => ['todayCheckIns', userId] as const,
  
  // 习惯相关
  habits: (userId: string) => ['habits', userId] as const,
  habitLibrary: ['habitLibrary'] as const,
  myHabitLibrary: (userId: string) => ['myHabitLibrary', userId] as const,
  userMicroBehaviors: (userId: string) => ['userMicroBehaviors', userId] as const,
  
  // 模板库相关
  recipeTemplates: (category?: string) => ['recipeTemplates', category] as const,
  habitTemplates: (category?: string) => ['habitTemplates', category] as const,
  
  // 奖励相关
  rewards: (userId: string) => ['rewards', userId] as const,
} as const;
