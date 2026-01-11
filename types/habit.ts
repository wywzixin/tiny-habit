// 微行为类型
export interface MicroBehavior {
  id: string;
  habitId: string;
  name: string;
  icon: string;
  anchor: string;
  behavior: string;
  celebration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: number[]; // 0-6 代表周日到周六
  reminderEnabled: boolean;
  reminderTime?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 习惯类型（父级）
export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  microBehaviorIds: string[];
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// 打卡记录类型
export interface CheckIn {
  id: string;
  microBehaviorId: string;
  habitId: string;
  userId: string;
  checkedAt: string;
  pointsEarned: number;
}

// 奖励类型
export interface Reward {
  id: string;
  userId: string;
  name: string;
  icon: string;
  cost: number;
  status: 'pending' | 'redeemed';
  redeemedAt?: string;
  createdAt: string;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  level: number;
  totalPoints: number;
  availablePoints: number;
}

// 习惯库模板类型
export interface HabitTemplate {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  category: string;
  description: string;
  suggestedAnchors?: string[];
  suggestedBehaviors?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  popularity: number;
}

// 配方模板类型
export interface RecipeTemplate {
  id: string;
  name: string;
  icon: string;
  anchor: string;
  behavior: string;
  celebration: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  popularity: number;
}
