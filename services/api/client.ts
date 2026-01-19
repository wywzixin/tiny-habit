import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../stores/authStore';

// API 基础配置
export const API_BASE_URL = 'http://192.168.10.57:8081';

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 创建 Axios 实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response: any) => {
    const data = response.data as ApiResponse;
    
    // 后端返回 code !== 200 视为业务错误
    if (data.code !== 200) {
      return Promise.reject({
        code: data.code,
        message: data.message || '请求失败',
        data: data.data,
      });
    }
    
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    console.log('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // 401 未授权 - 清除 token 并跳转登录
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      // TODO: 跳转到登录页
    }
    
    // 网络错误（无响应）
    if (!error.response) {
      return Promise.reject({
        code: 0,
        message: error.code === 'ECONNABORTED' 
          ? '请求超时，请检查网络连接' 
          : '网络连接失败，请检查网络设置',
        data: null,
      });
    }
    
    // 有响应但出错
    const errorData = error.response.data;
    const errorMessage = errorData?.message || error.message || '请求失败';
    
    return Promise.reject({
      code: errorData?.code || error.response.status || 500,
      message: errorMessage,
      data: errorData?.data || null,
    });
  }
);

// 频率字段转换工具
export const frequencyUtils = {
  // 前端 number[] -> 后端 string
  serialize: (frequency: number[]): string => {
    return JSON.stringify(frequency);
  },
  
  // 后端 string -> 前端 number[]
  deserialize: (frequency: string): number[] => {
    try {
      return JSON.parse(frequency);
    } catch {
      return [1, 2, 3, 4, 5, 6, 7]; // 默认每天
    }
  },
};
