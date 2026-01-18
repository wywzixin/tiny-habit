# Tiny Habits - 双模式数据存储设计文档

> 更新日期：2026-01-18

---

## 📋 设计概述

Tiny Habits 采用**双模式数据存储架构**，支持未登录用户完整体验，登录后无缝切换到云端存储。

**核心理念：** 两套系统完全独立，仅在登录时通过数据迁移关联。

---

## 🔓 未登录模式（Guest Mode）

### 数据存储
- **存储方式：** AsyncStorage（本地）
- **网络请求：** ❌ 无（完全离线）

### 功能特性
✅ 完整的习惯养成功能  
✅ 创建配方、打卡、查看统计  
✅ 查看系统预设习惯库（本地代码）  
✅ 完全离线可用，无需网络  
❌ 无云同步，无多设备支持  
❌ 数据仅存本地，卸载应用后丢失  

### 数据来源

```typescript
// 用户习惯
const userHabits = useHabitStore((s) => s.userHabitTemplates); 
// 来源：AsyncStorage

// 系统习惯
const systemHabits = localSystemHabits; 
// 来源：本地代码预置（10个系统习惯）

// 微行为
const behaviors = useHabitStore((s) => s.microBehaviors); 
// 来源：AsyncStorage

// 打卡记录
const checkIns = useHabitStore((s) => s.checkIns); 
// 来源：AsyncStorage
```

### 关键实现

```typescript
// app/create.tsx - 创建配方
const handleCreate = async () => {
  if (!canCreate) return;

  // 未登录：保存到 AsyncStorage
  if (!user?.id) {
    // 保存习惯
    const goalName = goal.trim();
    if (goalName && !userHabitTemplates.some(h => h.name === goalName)) {
      addUserHabitTemplate(goalName);
    }

    // 保存微行为
    addMicroBehavior({
      habitId: 'local-habit-1',
      name: behavior,
      icon: '✨',
      anchor,
      behavior,
      celebration,
      difficulty: 'easy',
      frequency,
      reminderEnabled,
      reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
      sortOrder: 0,
      isActive: true,
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
    return;
  }

  // ... 已登录逻辑
};
```

### 本地系统习惯库

```typescript
// app/create.tsx
const localSystemHabits = [
  {
    id: 'system-1',
    name: '多喝水',
    icon: '💧',
    category: '推荐',
    source: 'system',
    description: '每天8杯水，保持身体水分',
    popularity: 100,
  },
  {
    id: 'system-2',
    name: '早起',
    icon: '🌅',
    category: '推荐',
    source: 'system',
    description: '早睡早起身体好',
    popularity: 95,
  },
  // ... 共10个系统习惯
];
```

---

## 🔐 已登录模式（Authenticated Mode）

### 数据存储
- **存储方式：** Java 后端 + MySQL
- **网络请求：** ✅ 有（所有数据从后端获取）

### 功能特性
✅ 所有功能完整支持  
✅ 云端存储，数据永久保存  
✅ 多设备同步  
✅ 数据备份与恢复  
✅ 查看系统习惯库（后端 API）  
✅ 未来支持社交分享  

### 数据来源

```typescript
// 所有数据从后端 API 获取
const { data: cloudHabits } = useHabitLibrary(undefined, { 
  enabled: !!user?.id  // 仅在已登录时调用
});

const { data: behaviors } = useUserMicroBehaviors(user?.id);
```

### 关键实现

```typescript
// app/create.tsx - 创建配方
const handleCreate = async () => {
  if (!canCreate) return;

  // ... 未登录逻辑

  // 已登录：调用后端 API
  try {
    await createRecipeMutation.mutateAsync({
      habitName: goal.trim() || behavior.trim(),
      habitIcon: '✨',
      habitCategory: '自定义',
      microBehavior: {
        name: behavior,
        icon: '✨',
        anchor,
        behavior,
        celebration,
        difficulty: 'easy',
        frequency,
        reminderEnabled,
        reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
      },
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  } catch (error: any) {
    console.error('创建配方失败:', error);
    Alert.alert('创建失败', '请稍后重试');
  }
};
```

---

## 🔄 数据源切换逻辑

### 习惯库数据源

```typescript
// app/create.tsx
const habitLibraryData = useMemo(() => {
  // 已登录：仅使用云端数据
  if (user?.id) {
    return cloudHabits;
  }

  // 未登录：本地用户习惯 + 本地系统习惯
  const localHabitsFormatted = userHabitTemplates.map(h => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    category: '新建',
    source: 'user' as const,
    microBehaviorCount: 0,
    description: h.desc,
  }));

  return [...localHabitsFormatted, ...localSystemHabits];
}, [user?.id, userHabitTemplates]);
```

### 条件调用后端 API

```typescript
// services/api/hooks/useHabit.ts
export const useHabitLibrary = (category?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.habitLibrary, category],
    queryFn: () => habitApi.getHabitLibrary(category),
    enabled: options?.enabled !== false, // 默认启用，除非明确设置为 false
  });
};

// app/create.tsx - 使用
const { data: cloudHabits = [] } = useHabitLibrary(
  undefined,
  { enabled: !!user?.id } // 仅在已登录时调用
);
```

---

## 🔄 登录时数据迁移（待实现）

### 迁移流程

```
1. 用户登录成功
2. 读取 AsyncStorage 中的所有数据
3. 上传到后端数据库
4. 上传成功后清空 AsyncStorage
5. 切换到云端数据源
```

### 迁移内容

- 用户创建的习惯
- 所有微行为配方
- 历史打卡记录
- 行动值积分

### 实现代码（待开发）

```typescript
// services/migration/migrateLocalData.ts
export const migrateLocalDataToCloud = async () => {
  try {
    // 1. 读取 AsyncStorage 中的所有数据
    const localDataStr = await AsyncStorage.getItem('habit-storage');
    if (!localDataStr) return;
    
    const localData = JSON.parse(localDataStr);
    
    // 2. 上传用户习惯
    for (const habit of localData.userHabitTemplates) {
      // 创建习惯（后端会自动关联用户）
      // 注意：需要先创建习惯，再创建微行为
    }
    
    // 3. 上传微行为
    for (const behavior of localData.microBehaviors) {
      await createRecipe({
        habitName: behavior.name,
        habitIcon: behavior.icon,
        habitCategory: '自定义',
        microBehavior: {
          name: behavior.name,
          icon: behavior.icon,
          anchor: behavior.anchor,
          behavior: behavior.behavior,
          celebration: behavior.celebration,
          difficulty: behavior.difficulty,
          frequency: behavior.frequency,
          reminderEnabled: behavior.reminderEnabled,
          reminderTime: behavior.reminderTime,
        },
      });
    }
    
    // 4. 上传打卡记录
    for (const checkIn of localData.checkIns) {
      // 调用打卡 API
    }
    
    // 5. 清空 AsyncStorage
    await AsyncStorage.removeItem('habit-storage');
    
    // 6. 刷新云端数据
    queryClient.invalidateQueries();
    
    console.log('数据迁移成功');
  } catch (error) {
    console.error('数据迁移失败:', error);
    // 迁移失败不影响登录，数据仍保留在本地
  }
};

// 在登录成功后调用
// app/auth/login.tsx
const handleLogin = async () => {
  const result = await loginMutation.mutateAsync({...});
  
  // 登录成功后迁移数据
  await migrateLocalDataToCloud();
  
  router.replace('/(tabs)');
};
```

---

## 📊 数据流对比

| 功能 | 未登录用户 | 已登录用户 |
|-----|----------|----------|
| **习惯库** | 本地代码 + AsyncStorage | 后端 API |
| **创建配方** | AsyncStorage | 后端 API |
| **删除习惯** | AsyncStorage | 后端 API |
| **打卡记录** | AsyncStorage | 后端 API |
| **系统习惯** | 本地预置10个 | 后端返回 |
| **网络请求** | ❌ 无 | ✅ 有 |
| **多设备同步** | ❌ 不支持 | ✅ 支持 |
| **数据持久化** | ⚠️ 卸载丢失 | ✅ 永久保存 |

---

## 🎯 关键设计原则

### 1. 完全独立
- 未登录和已登录两套系统互不干扰
- 数据源完全分离
- 逻辑清晰，易于维护

### 2. 条件调用
- 后端 API 仅在已登录时调用
- 使用 `enabled: !!user?.id` 控制
- 避免不必要的网络请求

### 3. 本地优先
- 未登录用户使用本地预置数据
- 无需网络即可完整体验
- 性能优秀，响应迅速

### 4. 无缝切换
- 登录时自动迁移数据
- 用户无感知切换
- 数据不丢失

### 5. 性能优化
- 未登录用户无网络请求
- 已登录用户使用 React Query 缓存
- 减少不必要的重新渲染

---

## 🚀 设计优势

### 用户体验
- 🎯 **降低门槛**：无需注册即可体验完整功能
- ⚡ **响应迅速**：未登录用户无网络延迟
- 🔄 **无缝切换**：登录后自动迁移数据
- 💾 **数据安全**：登录后数据永久保存

### 技术优势
- 🏗️ **架构清晰**：两套系统完全独立
- 🔧 **易于维护**：逻辑分离，不会混淆
- 🚀 **性能优秀**：减少不必要的网络请求
- 📦 **离线可用**：未登录用户完全离线

### 商业价值
- 📈 **提高转化率**：用户可以先体验再注册
- 🎁 **降低流失率**：无需注册门槛
- 💰 **增加留存**：数据迁移后用户更愿意留下
- 🌟 **口碑传播**：良好的体验带来自然增长

---

## 📝 实现清单

### 已完成 ✅
- [x] 双模式数据源切换逻辑
- [x] 未登录用户本地存储
- [x] 已登录用户后端 API 调用
- [x] 条件调用后端接口
- [x] 本地系统习惯库预置
- [x] 创建配方双模式支持
- [x] 删除习惯双模式支持

### 待实现 ⏳
- [ ] 登录时数据迁移功能
- [ ] 打卡功能双模式支持
- [ ] 首页数据源切换
- [ ] 统计页数据源切换
- [ ] 详情页数据源切换
- [ ] 编辑功能双模式支持

---

## 🔗 相关文档

- **产品需求文档** - `docs/prd.md` - 第 1.5 节
- **技术架构文档** - `docs/architecture.md`
- **API 接口文档** - `docs/api.md`
- **开发指南** - `CLAUDE.md` - 双模式数据存储架构

---

**最后更新：** 2026-01-18  
**维护者：** Tiny Habits 开发团队
