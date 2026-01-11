# Tiny Habits - 前端开发规范

## 1. 技术栈版本

| 技术 | 版本 | 说明 |
|-----|------|------|
| Expo SDK | 54+ | 开发框架 |
| React Native | 0.81+ | 运行时 |
| React | 19.1.0 | UI 库 |
| TypeScript | 5.x | 类型系统 |
| expo-router | 4.x | 文件路由 |
| Zustand | 5.x | 状态管理 |
| @tanstack/react-query | 5.x | 异步数据 |
| NativeWind | 4.x | 样式方案 |
| react-native-reanimated | 3.x | 动画库 |

---

## 2. 项目结构规范

```
app/                    # 页面文件 (Expo Router)
components/
├── ui/                # 基础组件 (Button, Card, Input)
└── habit/             # 业务组件 (HabitCard, CheckButton)
stores/                # Zustand 状态
hooks/                 # 自定义 Hooks
services/              # API 请求
constants/             # 常量配置
types/                 # TypeScript 类型
```

---

## 3. 命名规范

### 3.1 文件命名

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件 | PascalCase | `HabitCard.tsx` |
| Hook | camelCase | `useHabitStore.ts` |
| 工具 | camelCase | `formatDate.ts` |
| 常量 | camelCase | `colors.ts` |
| 类型 | camelCase | `habit.ts` |

### 3.2 变量命名

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件 | PascalCase | `HabitCard` |
| 函数 | camelCase | `handleCheckIn` |
| 常量 | UPPER_SNAKE | `MAX_HABITS` |
| 布尔值 | is/has前缀 | `isLoading` |

---

## 4. 组件规范

### 4.1 组件结构

```tsx
// 1. 导入
import { View, Text } from 'react-native';

// 2. 类型定义
interface Props {
  title: string;
  onPress: () => void;
}

// 3. 组件
export function HabitCard({ title, onPress }: Props) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

---

## 5. 样式规范 (NativeWind)

```typescript
// constants/colors.ts
export const colors = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  accent: '#F9A825',
};
```
