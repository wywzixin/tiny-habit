# Tiny Habits - 技术架构文档

## 1. 技术栈概览

### 1.1 前端技术栈

| 类别 | 技术 | 版本 |
|-----|------|------|
| 框架 | Expo SDK | 54+ |
| 运行时 | React Native | 0.81+ |
| UI库 | React | 19.1.0 |
| 路由 | expo-router | 4.x |
| 状态管理 | Zustand | 5.x |
| 异步数据 | @tanstack/react-query | 5.x |
| 样式 | NativeWind + TailwindCSS | 4.x |
| 动画 | react-native-reanimated | 3.x |
| 代码规范 | eslint-config-expo | latest |

### 1.2 后端技术栈

| 类别 | 技术 | 版本 |
|-----|------|------|
| 语言 | Java | JDK 25 |
| 框架 | Spring Boot | 3.x |
| 数据库 | MySQL | 8.x |
| ORM | MyBatis-Plus | 3.x |
| 缓存 | Redis | 7.x |

---

## 2. 前端架构

### 2.1 项目目录结构

```
tiny-habits/
├── app/                      # Expo Router 页面
│   ├── (tabs)/              # Tab 导航组
│   │   ├── _layout.tsx      # Tab 布局
│   │   ├── index.tsx        # 首页
│   │   ├── discover.tsx     # 发现页
│   │   ├── stats.tsx        # 统计页
│   │   └── profile.tsx      # 我的页
│   ├── create.tsx           # 创建配方
│   ├── detail/[id].tsx      # 习惯详情
│   ├── edit/[id].tsx        # 编辑习惯
│   ├── rewards.tsx          # 奖励中心
│   └── _layout.tsx          # 根布局
├── components/              # 组件
│   ├── ui/                  # 基础UI组件
│   └── habit/               # 业务组件
├── stores/                  # Zustand 状态
├── hooks/                   # 自定义 Hooks
├── services/                # API 服务
├── constants/               # 常量配置
├── types/                   # TypeScript 类型
└── assets/                  # 静态资源
```

### 2.2 状态管理 (Zustand)

```typescript
// stores/habitStore.ts
interface HabitStore {
  habits: Habit[];
  actionPoints: number;
  addHabit: (habit: Habit) => void;
  checkIn: (id: string) => void;
  removeHabit: (id: string) => void;
}
```

### 2.3 核心组件

| 组件 | 路径 | 说明 |
|-----|------|------|
| HabitCard | components/habit/ | 习惯卡片 |
| CheckButton | components/habit/ | 打卡按钮 |
| Calendar | components/ui/ | 日历组件 |
| BottomSheet | components/ui/ | 底部弹窗 |

---

## 3. 后端架构

### 3.1 API 模块

| 模块 | 路径 | 说明 |
|-----|------|------|
| 用户 | /api/user | 登录注册 |
| 习惯 | /api/habit | CRUD |
| 打卡 | /api/checkin | 打卡记录 |
| 统计 | /api/stats | 数据统计 |
