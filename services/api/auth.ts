import { apiClient, ApiResponse } from './client';
import { User } from '../../stores/authStore';

// 认证相关的 API 响应类型
export interface AuthResponse {
  token: string;
  user: User;
}

// 注册请求参数
export interface RegisterRequest {
  username: string;
  account: string; // 邮箱或手机号
  password: string;
}

// 登录请求参数
export interface LoginRequest {
  account: string; // 邮箱或手机号
  password: string;
}

// 重置密码请求参数
export interface ResetPasswordRequest {
  account: string;
  newPassword: string;
  confirmPassword: string;
}

// 更新用户信息请求参数
export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'unknown';
}

/**
 * 用户注册
 * POST /api/user/register
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/api/user/register',
    data
  );
  return response.data.data;
};

/**
 * 用户登录
 * POST /api/user/login
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/api/user/login',
    data
  );
  return response.data.data;
};

/**
 * 重置密码
 * POST /api/user/reset-password
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await apiClient.post<ApiResponse<null>>('/api/user/reset-password', data);
};

/**
 * 获取用户信息
 * GET /api/user/{id}
 */
export const getUserInfo = async (userId: number): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`/api/user/${userId}`);
  return response.data.data;
};

/**
 * 更新用户信息
 * PUT /api/user/profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>('/api/user/profile', data);
  return response.data.data;
};
