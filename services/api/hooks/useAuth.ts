import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import { queryClient, queryKeys } from '../queryClient';
import * as authApi from '../auth';

/**
 * 获取用户友好的错误信息
 */
export const getUserFriendlyError = (mutation: any): string => {
  if (!mutation.isError || !mutation.error) return '';
  
  const error = mutation.error as any;
  const getErrorMessage = mutation.meta?.getErrorMessage;
  
  if (getErrorMessage && typeof getErrorMessage === 'function') {
    return getErrorMessage(error);
  }
  
  return '操作失败，请稍后重试';
};

/**
 * 用户注册 Hook
 */
export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // 保存 token 和用户信息
      setAuth(data.token, data.user);
      
      // TODO: 检查是否有游客数据需要同步
      // syncGuestDataToServer();
    },
    onError: (error: any) => {
      // 只在控制台输出详细错误信息供开发调试
      console.error('注册失败 - 详细信息:', error);
    },
    // 使用 meta 来存储用户友好的错误信息
    meta: {
      getErrorMessage: (error: any) => {
        if (error.code === 0) {
          return '网络连接失败，请检查网络';
        } else if (error.message?.includes('已存在') || error.message?.includes('已注册')) {
          return '该账号已被注册';
        } else if (error.message?.includes('格式') || error.message?.includes('无效')) {
          return '账号格式不正确';
        }
        return '注册失败，请稍后重试';
      },
    },
  });
};

/**
 * 用户登录 Hook
 */
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // 保存 token 和用户信息
      setAuth(data.token, data.user);
      
      // TODO: 检查是否有游客数据需要同步
      // syncGuestDataToServer();
    },
    onError: (error: any) => {
      // 只在控制台输出详细错误信息供开发调试
      console.error('登录失败 - 详细信息:', error);
    },
    // 使用 meta 来存储用户友好的错误信息
    meta: {
      getErrorMessage: (error: any) => {
        if (error.code === 0) {
          return '网络连接失败，请检查网络';
        } else if (error.code === 401 || error.message?.includes('密码') || error.message?.includes('账号')) {
          return '账号或密码错误';
        } else if (error.code === 404) {
          return '账号不存在';
        }
        return '登录失败，请稍后重试';
      },
    },
  });
};

/**
 * 重置密码 Hook
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onError: (error: any) => {
      // 只在控制台输出详细错误信息供开发调试
      console.error('重置密码失败 - 详细信息:', error);
    },
    // 使用 meta 来存储用户友好的错误信息
    meta: {
      getErrorMessage: (error: any) => {
        if (error.code === 0) {
          return '网络连接失败，请检查网络';
        } else if (error.message?.includes('不存在') || error.code === 404) {
          return '账号不存在';
        } else if (error.message?.includes('密码')) {
          return '密码格式不正确';
        }
        return '重置密码失败，请稍后重试';
      },
    },
  });
};

/**
 * 获取用户信息 Hook
 */
export const useUserInfo = (userId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.user(userId.toString()),
    queryFn: () => authApi.getUserInfo(userId),
    enabled: enabled && !!userId,
  });
};

/**
 * 更新用户信息 Hook
 */
export const useUpdateProfile = () => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);
  
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      // 更新本地用户信息
      updateUser(data);
      
      // 刷新用户信息缓存
      if (user) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user(user.id.toString()),
        });
      }
    },
    onError: (error: any) => {
      console.error('更新用户信息失败:', error);
    },
  });
};

/**
 * 登出 Hook
 */
export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  return () => {
    // 清除认证信息
    clearAuth();
    
    // 清除所有 React Query 缓存
    queryClient.clear();
    
    // TODO: 如果需要，可以调用后端登出接口
  };
};
