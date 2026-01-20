# Tiny Habits - API 接口文档

> Base URL: `http://localhost:8081`
> 
> 更新日期：2026-01-14

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| code | int | 状态码，200 成功，401 未授权，500 失败 |
| message | string | 提示信息 |
| data | object | 响应数据 |

---

## 认证说明

除以下接口外，其他接口都需要在请求头中携带 JWT Token：

**无需认证的接口：**
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `GET /api/library/**` - 模板库相关接口

**请求头格式：**
```
Authorization: Bearer <token>
```

**认证失败响应：**
```json
{
  "code": 401,
  "message": "Token 无效或已过期",
  "data": null
}
```

---

## 1. 用户模块 `/api/user`

### 1.1 用户注册

`POST /api/user/register` （无需认证）

**请求参数：**
```json
{
  "username": "张三",
  "account": "zhangsan@example.com",
  "password": "123456"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | String | 是 | 用户昵称 |
| account | String | 是 | 邮箱或手机号（纯数字≥6位） |
| password | String | 是 | 登录密码（最少6位） |

**账号识别规则：**
- 包含 `@` 符号 → 识别为邮箱
- 纯数字且 ≥6 位 → 识别为手机号
- 其他格式 → 返回错误码 407

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "user": {
      "id": 1,
      "username": "张三",
      "email": "zhangsan@example.com",
      "phone": null,
      "avatarUrl": null,
      "gender": "unknown",
      "level": 1,
      "totalPoints": 0,
      "availablePoints": 0,
      "createdAt": "2026-01-14T10:00:00"
    }
  }
}
```

**错误响应：**
```json
{
  "code": 402,
  "message": "账号已存在",
  "data": null
}
```

### 1.2 用户登录

`POST /api/user/login` （无需认证）

**请求参数：**
```json
{
  "account": "zhangsan@example.com",
  "password": "123456"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| account | String | 是 | 邮箱或手机号（纯数字≥6位） |
| password | String | 是 | 登录密码 |

**账号识别规则：**
- 包含 `@` 符号 → 识别为邮箱登录
- 纯数字 → 识别为手机号登录

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "user": {
      "id": 1,
      "username": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "avatarUrl": null,
      "gender": "unknown",
      "level": 1,
      "totalPoints": 0,
      "availablePoints": 0
    }
  }
}
```

**错误响应：**
```json
{
  "code": 405,
  "message": "账号或密码错误",
  "data": null
}
```

### 1.3 获取用户信息

`GET /api/user/{id}`

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| id | Long | 用户ID |

### 1.4 更新用户信息

`PUT /api/user/profile`

**请求参数：**
```json
{
  "username": "新昵称",
  "avatarUrl": "https://example.com/avatar.png",
  "gender": "male"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | String | 否 | 用户昵称 |
| avatarUrl | String | 否 | 头像URL |
| gender | String | 否 | 性别：male/female/unknown |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "新昵称",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "avatarUrl": "https://example.com/avatar.png",
    "gender": "male"
  }
}
```

### 1.5 重置密码

`POST /api/user/reset-password` （无需认证）

**请求参数：**
```json
{
  "account": "zhangsan@example.com",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| account | String | 是 | 邮箱或手机号 |
| newPassword | String | 是 | 新密码（最少6位） |
| confirmPassword | String | 是 | 确认密码 |

**注意事项：**
- 为简化流程，无需验证码验证
- 两次密码必须一致
- 账号必须已存在

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应：**
```json
{
  "code": 406,
  "message": "两次密码不一致",
  "data": null
}
```

---

## 8. 配方模块 `/api/recipe`

### 8.1 创建配方（组合接口）

`POST /api/recipe/create`

**功能说明：**
- 一次性创建习惯+微行为，或为已有习惯添加微行为
- 如果 `habitId` 为 `null`，则创建新习惯
- 如果 `habitId` 有值，则使用已有习惯

**请求参数：**
```json
{
  "habitId": null,
  "habitName": "健康生活",
  "habitIcon": "💪",
  "habitCategory": "健康",
  "habitDescription": "养成健康的生活习惯",
  "microBehavior": {
    "name": "晨起喝水",
    "icon": "💧",
    "anchor": "起床后",
    "behavior": "喝一口水",
    "celebration": "对自己微笑",
    "difficulty": "easy",
    "frequency": "[1,2,3,4,5,6,7]",
    "reminderEnabled": true,
    "reminderTime": "07:00:00"
  }
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| habitId | Long | 否 | 习惯ID，null=创建新习惯，有值=使用已有习惯 |
| habitName | String | 条件必填 | 习惯名称（habitId为null时必填） |
| habitIcon | String | 否 | 习惯图标 |
| habitCategory | String | 条件必填 | 习惯分类（habitId为null时必填） |
| habitDescription | String | 否 | 习惯描述 |
| microBehavior | Object | 是 | 微行为信息 |

**microBehavior 字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | String | 是 | 微行为名称 |
| icon | String | 否 | 图标 |
| anchor | String | 是 | 锚点行为 |
| behavior | String | 是 | 微行为内容 |
| celebration | String | 是 | 庆祝方式 |
| difficulty | String | 否 | 难度：easy/medium/hard，默认easy |
| frequency | String | 是 | 频率，JSON数组字符串，如"[1,2,3,4,5,6,7]" |
| reminderEnabled | Boolean | 否 | 是否开启提醒，默认false |
| reminderTime | String | 否 | 提醒时间，格式HH:mm:ss |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "habit": {
      "id": 1,
      "name": "健康生活",
      "icon": "💪",
      "category": "健康",
      "isNew": true
    },
    "microBehavior": {
      "id": 1,
      "habitId": 1,
      "userId": 1,
      "name": "晨起喝水",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "frequency": "[1,2,3,4,5,6,7]",
      "reminderEnabled": true,
      "reminderTime": "07:00:00"
    }
  }
}
```

**使用场景：**

**场景一：第一次创建配方（创建新习惯）**
```json
{
  "habitId": null,
  "habitName": "健康生活",
  "habitCategory": "健康",
  "microBehavior": { ... }
}
```

**场景二：为已有习惯添加微行为**
```json
{
  "habitId": 1,
  "microBehavior": { ... }
}
```

### 8.2 更新配方（编辑接口）

`PUT /api/recipe/update`

**功能说明：**
- 更新微行为信息
- 如果微行为绑定了习惯，也可以同时更新习惯信息
- 用于微行为详情页的编辑功能

**请求参数：**
```json
{
  "microBehaviorId": 1,
  "habitName": "健康生活（修改后）",
  "habitIcon": "💪",
  "habitCategory": "健康",
  "habitDescription": "养成健康的生活习惯",
  "microBehavior": {
    "name": "晨起喝水（修改后）",
    "icon": "💧",
    "anchor": "起床后",
    "behavior": "喝一大口水",
    "celebration": "对自己微笑",
    "difficulty": "easy",
    "frequency": "[1,2,3,4,5,6,7]",
    "reminderEnabled": true,
    "reminderTime": "07:30:00"
  }
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| microBehaviorId | Long | 是 | 要更新的微行为ID |
| habitName | String | 否 | 习惯名称（如果要修改） |
| habitIcon | String | 否 | 习惯图标（如果要修改） |
| habitCategory | String | 否 | 习惯分类（如果要修改） |
| habitDescription | String | 否 | 习惯描述（如果要修改） |
| microBehavior | Object | 是 | 微行为信息 |

**microBehavior 字段说明：** 同创建接口

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "habit": {
      "id": 1,
      "name": "健康生活（修改后）",
      "icon": "💪",
      "category": "健康",
      "isNew": false
    },
    "microBehavior": {
      "id": 1,
      "habitId": 1,
      "userId": 1,
      "name": "晨起喝水（修改后）",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一大口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "frequency": "[1,2,3,4,5,6,7]",
      "reminderEnabled": true,
      "reminderTime": "07:30:00"
    }
  }
}
```

**注意事项：**
- 只能更新自己的微行为
- 如果微行为没有绑定习惯（habitId为null），习惯相关字段会被忽略
- 如果微行为绑定了习惯，只会更新提供的习惯字段（未提供的字段保持不变）

---

## 2. 习惯模块 `/api/habit`

> **注意：** 创建习惯请使用 `POST /api/recipe/create` 接口。

### 2.1 获取我的习惯库

`GET /api/habit/my-library`

**功能说明：**
- 获取用户的所有习惯
- 用于"我的习惯库"管理页面
- 展示习惯列表和微行为数量
- 提供删除习惯的入口

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "健康生活",
      "icon": "💪",
      "category": "健康",
      "microBehaviorCount": 3,
      "isFromSystem": false
    },
    {
      "id": 2,
      "name": "多喝水",
      "icon": "💧",
      "category": "推荐",
      "microBehaviorCount": 1,
      "isFromSystem": true
    }
  ]
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | Long | 习惯ID |
| name | String | 习惯名称 |
| icon | String | 习惯图标 |
| category | String | 分类 |
| microBehaviorCount | Integer | 该习惯下的微行为数量 |
| isFromSystem | Boolean | 是否来自系统预设 |

### 2.2 获取用户的微行为列表

`GET /api/habit/user/{userId}/micro-behaviors`

**功能说明：**
- 获取用户所有的微行为列表
- 用于首页展示
- 包含微行为的完整信息和所属习惯信息

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| userId | Long | 用户ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "habitId": 1,
      "habitName": "健康生活",
      "habitIcon": "💪",
      "name": "晨起喝水",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "frequency": "[1,2,3,4,5,6,7]",
      "reminderEnabled": true,
      "reminderTime": "07:00:00",
      "isActive": true
    }
  ]
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | Long | 微行为ID |
| habitId | Long | 所属习惯ID |
| habitName | String | 所属习惯名称 |
| habitIcon | String | 所属习惯图标 |
| name | String | 微行为名称 |
| icon | String | 微行为图标 |
| anchor | String | 锚点行为 |
| behavior | String | 微行为内容 |
| celebration | String | 庆祝方式 |
| difficulty | String | 难度 |
| frequency | String | 频率（JSON数组） |
| reminderEnabled | Boolean | 是否开启提醒 |
| reminderTime | String | 提醒时间 |
| isActive | Boolean | 是否激活 |

### 2.3 获取习惯库（统一接口）

`GET /api/habit/library`

**功能说明：**
- 获取用户自己创建的习惯 + 系统习惯库
- 用于创建配方页面的习惯选择
- 用一个字段区分来源（user/system）
- 用户创建的习惯分类默认为"新建"

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| category | String | 否 | 分类筛选（仅对系统习惯有效） |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "健康生活",
      "icon": "💪",
      "category": "新建",
      "source": "user",
      "microBehaviorCount": 3,
      "description": null,
      "popularity": null
    },
    {
      "id": 1,
      "name": "多喝水",
      "icon": "💧",
      "category": "健康",
      "source": "system",
      "microBehaviorCount": null,
      "description": "每天8杯水",
      "popularity": 100
    }
  ]
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | Long | 习惯ID |
| name | String | 习惯名称 |
| icon | String | 习惯图标 |
| category | String | 分类（用户习惯为"新建"） |
| source | String | 来源：user=用户创建，system=系统预设 |
| microBehaviorCount | Integer | 微行为数量（仅用户习惯有值） |
| description | String | 描述（仅系统习惯有值） |
| popularity | Integer | 热度（仅系统习惯有值） |

### 2.4 删除习惯

`DELETE /api/habit/{id}`

**功能说明：**
- 删除用户自己创建的习惯
- 会同时删除该习惯下的所有微行为
- **系统推荐的习惯不能删除**

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| id | Long | 习惯ID |

**删除规则：**
| 习惯类型 | 是否可删除 | 说明 |
|---------|----------|------|
| 用户创建的习惯 | ✅ 可以 | `isFromSystem: false` |
| 系统推荐的习惯 | ❌ 不可以 | `isFromSystem: true` |

**注意事项：**
- ⚠️ 删除习惯会同时删除该习惯下的所有微行为
- ⚠️ 删除操作为软删除，数据不会真正丢失
- ⚠️ 只能删除自己的习惯
- ⚠️ 系统推荐的习惯（从习惯库添加的）不能删除

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应：**

**习惯不存在或无权操作：**
```json
{
  "code": 404,
  "message": "习惯不存在或无权操作",
  "data": null
}
```

**尝试删除系统习惯：**
```json
{
  "code": 403,
  "message": "系统推荐的习惯不能删除",
  "data": null
}
```

**前端处理建议：**
```javascript
// 在习惯列表中，根据 isFromSystem 字段控制删除按钮显示
habits.map(habit => (
  <View>
    <Text>{habit.name}</Text>
    {!habit.isFromSystem && (
      <Button onPress={() => deleteHabit(habit.id)}>删除</Button>
    )}
  </View>
))
```

---

**功能说明：**
- 获取用户的所有习惯（包含自己创建的和从系统习惯库添加的）
- 用于创建配方页面的习惯选择弹窗

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "健康生活",
      "icon": "💪",
      "category": "健康",
      "microBehaviorCount": 3,
      "isFromSystem": false
    },
    {
      "id": 2,
      "name": "多喝水",
      "icon": "💧",
      "category": "推荐",
      "microBehaviorCount": 1,
      "isFromSystem": true
    }
  ]
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | Long | 习惯ID |
| name | String | 习惯名称 |
| icon | String | 习惯图标 |
| category | String | 分类 |
| microBehaviorCount | Integer | 该习惯下的微行为数量 |
| isFromSystem | Boolean | 是否来自系统预设 |

---

## 3. 微行为模块 `/api/micro-behavior`

> **注意：** 
> - 创建微行为请使用 `POST /api/recipe/create` 接口
> - 编辑微行为请使用 `PUT /api/recipe/update` 接口

### 3.1 创建微行为

`POST /api/micro-behavior`

**请求参数：**
```json
{
  "habitId": 1,
  "userId": 1,
  "name": "晨起喝水",
  "icon": "💧",
  "anchor": "起床后",
  "behavior": "喝一口水",
  "celebration": "对自己微笑",
  "difficulty": "easy",
  "frequency": "[1,2,3,4,5,6,7]",
  "reminderEnabled": true,
  "reminderTime": "07:00:00"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| habitId | Long | 是 | 关联的父习惯ID |
| userId | Long | 是 | 用户ID |
| name | String | 是 | 微行为名称 |
| icon | String | 否 | 图标 |
| anchor | String | 是 | 锚点行为 |
| behavior | String | 是 | 微行为内容 |
| celebration | String | 是 | 庆祝方式 |
| difficulty | String | 否 | 难度：easy/medium/hard |
| frequency | String | 是 | 频率，JSON数组 [1-7] 代表周一到周日 |
| reminderEnabled | Boolean | 否 | 是否开启提醒 |
| reminderTime | String | 否 | 提醒时间 HH:mm:ss |

### 3.2 获取微行为详情

`GET /api/micro-behavior/{id}`

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| id | Long | 微行为ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "habitId": 1,
    "userId": 1,
    "name": "晨起喝水",
    "icon": "💧",
    "anchor": "起床后",
    "behavior": "喝一口水",
    "celebration": "对自己微笑",
    "difficulty": "easy",
    "frequency": "[1,2,3,4,5,6,7]",
    "reminderEnabled": true,
    "reminderTime": "07:00:00",
    "sortOrder": 0,
    "isActive": true,
    "createdAt": "2026-01-17T08:00:00",
    "updatedAt": "2026-01-17T08:00:00"
  }
}
```

### 3.3 获取用户的微行为列表

`GET /api/micro-behavior/user/{userId}`

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| userId | Long | 用户ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "habitId": 1,
      "userId": 1,
      "name": "晨起喝水",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "frequency": "[1,2,3,4,5,6,7]",
      "reminderEnabled": true,
      "reminderTime": "07:00:00",
      "isActive": true
    },
    {
      "id": 2,
      "habitId": null,
      "userId": 1,
      "name": "双脚落地后",
      "icon": "🛏️",
      "anchor": "起床后",
      "behavior": "说一句'今天很棒'",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "frequency": "[1,2,3,4,5,6,7]",
      "reminderEnabled": false,
      "isActive": true
    }
  ]
}
```

### 3.4 获取习惯下的微行为列表

`GET /api/micro-behavior/habit/{habitId}`

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| habitId | Long | 习惯ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "habitId": 1,
      "userId": 1,
      "name": "晨起喝水",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "frequency": "[1,2,3,4,5,6,7]",
      "reminderEnabled": true,
      "reminderTime": "07:00:00",
      "isActive": true
    }
  ]
}
```

### 3.5 删除微行为

`DELETE /api/micro-behavior/{id}`

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| id | Long | 微行为ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应：**
```json
{
  "code": 500,
  "message": "微行为不存在",
  "data": null
}
```

### 3.6 从配方模板添加微行为

`POST /api/micro-behavior/add-from-template`

**功能说明：**
- 从配方模板库添加微行为到用户的微行为列表
- 用于发现页面点击"+"按钮
- 微行为不绑定习惯（habitId 为 null）
- 自动从模板复制数据

**请求参数：**
```json
{
  "templateId": 1,
  "frequency": "[1,2,3,4,5,6,7]",
  "reminderEnabled": false,
  "reminderTime": null
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| templateId | Long | 是 | 配方模板ID |
| frequency | String | 否 | 频率，默认"[1,2,3,4,5,6,7]"（每天） |
| reminderEnabled | Boolean | 否 | 是否开启提醒，默认false |
| reminderTime | String | 否 | 提醒时间 HH:mm:ss |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "habitId": null,
    "userId": 1,
    "name": "双脚落地后",
    "icon": "🛏️",
    "anchor": "起床后",
    "behavior": "说一句'今天很棒'",
    "celebration": "对自己微笑",
    "difficulty": "easy",
    "frequency": "[1,2,3,4,5,6,7]",
    "reminderEnabled": false,
    "reminderTime": null,
    "isActive": true,
    "createdAt": "2026-01-17T10:00:00"
  }
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "templateId不能为空",
  "data": null
}
```

```json
{
  "code": 500,
  "message": "配方模板不存在",
  "data": null
}
```

---

## 4. 打卡模块 `/api/checkin`

### 4.1 打卡

`POST /api/checkin`

**功能说明：**
- 用户完成微行为后打卡
- 每次打卡获得 10 个行动值
- 同一微行为每天只能打卡一次
- 支持从配方库添加的微行为（无关联习惯，habitId 为 null）

**请求参数：**
```json
{
  "microBehaviorId": 1,
  "habitId": 1  // 可选，从配方库添加的微行为可以为 null
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| microBehaviorId | Long | 是 | 微行为ID |
| habitId | Long | 否 | 习惯ID（从配方库添加的微行为可以为 null） |

**使用场景：**

1. **有关联习惯的微行为**（通过创建配方页面添加）
   ```json
   {
     "microBehaviorId": 1,
     "habitId": 1
   }
   ```

2. **从配方库添加的微行为**（无关联习惯）
   ```json
   {
     "microBehaviorId": 2,
     "habitId": null
   }
   ```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "microBehaviorId": 1,
    "habitId": 1,  // 如果是从配方库添加的，这里为 null
    "userId": 1,
    "checkedAt": "2026-01-20T08:30:00",
    "pointsEarned": 10
  }
}
```

**错误响应：**
```json
{
  "code": 500,
  "message": "今天已经打卡过了",
  "data": null
}
```

### 4.2 取消打卡

`POST /api/checkin/cancel`

**功能说明：**
- 取消今天的打卡记录
- 扣除对应获得的行动值
- 只能取消今天的打卡，不能取消历史打卡
- 支持从配方库添加的微行为（无关联习惯，habitId 为 null）

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "microBehaviorId": 1,
  "habitId": 1  // 可选，从配方库添加的微行为可以为 null
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| microBehaviorId | Long | 是 | 微行为ID |
| habitId | Long | 否 | 习惯ID（从配方库添加的微行为可以为 null） |

**使用场景：**

1. **有关联习惯的微行为**（通过创建配方页面添加）
   ```json
   {
     "microBehaviorId": 1,
     "habitId": 1
   }
   ```

2. **从配方库添加的微行为**（无关联习惯）
   ```json
   {
     "microBehaviorId": 2,
     "habitId": null
   }
   ```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pointsDeducted": 10
  }
}
```

**错误响应：**

**今天还没有打卡：**
```json
{
  "code": 500,
  "message": "今天还没有打卡记录",
  "data": null
}
```

**前端使用建议：**
```javascript
// 取消打卡前弹窗确认
const cancelCheckIn = async (microBehaviorId, habitId) => {
  const confirmed = await showConfirmDialog({
    title: '确认取消打卡',
    message: '取消后将扣除 10 个行动值，确定要取消吗？',
    confirmText: '确定',
    cancelText: '取消'
  });
  
  if (confirmed) {
    const response = await fetch('/api/checkin/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        microBehaviorId,
        habitId  // 如果没有关联习惯，可以传 null 或不传
      })
    });
    
    const result = await response.json();
    if (result.code === 200) {
      showToast(`已取消打卡，扣除 ${result.data.pointsDeducted} 个行动值`);
    }
  }
};
```

### 4.3 获取用户打卡记录

`GET /api/checkin/user/{userId}`

**功能说明：**
- 获取用户所有的打卡记录
- 按打卡时间倒序排列

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| userId | Long | 用户ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "microBehaviorId": 1,
      "habitId": 1,
      "userId": 1,
      "checkedAt": "2026-01-20T08:30:00",
      "pointsEarned": 10
    },
    {
      "id": 2,
      "microBehaviorId": 2,
      "habitId": 1,
      "userId": 1,
      "checkedAt": "2026-01-17T09:00:00",
      "pointsEarned": 1
    }
  ]
}
```

### 4.3 获取用户今日打卡记录

`GET /api/checkin/today/{userId}`

**功能说明：**
- 获取用户今天的打卡记录
- 用于首页显示已完成的微行为

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| userId | Long | 用户ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "microBehaviorId": 1,
      "habitId": 1,
      "userId": 1,
      "checkedAt": "2026-01-17T08:30:00",
      "pointsEarned": 1
    }
  ]
}
```

---

## 5. 奖励模块 `/api/reward`

### 5.1 创建奖励

`POST /api/reward`

**请求参数：**
```json
{
  "userId": 1,
  "name": "看一部电影",
  "icon": "🎬",
  "cost": 50
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| userId | Long | 是 | 用户ID |
| name | String | 是 | 奖励名称 |
| icon | String | 是 | 图标 |
| cost | Integer | 是 | 所需行动值（最低10） |

### 5.2 获取用户奖励列表

`GET /api/reward/user/{userId}`

### 5.3 兑换奖励

`POST /api/reward/{id}/redeem`

**请求参数：**
```json
{
  "userId": 1
}
```

---

## 6. 统计模块 `/api/stats`

### 6.1 获取用户统计数据

`GET /api/stats/user/{userId}`

**说明：** 获取用户的统计数据

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| userId | Long | 用户ID |

**响应字段说明：**
| 字段名 | 类型 | 说明 | 计算方式 |
|-------|------|------|---------|
| totalPoints | Integer | 累计积分 | 用户从注册以来获得的所有积分总和 |
| availablePoints | Integer | 可用积分 | 当前可以用来兑换奖励的积分 |
| level | Integer | 用户等级 | 当前等级，默认为 1 |
| habitCount | Long | 习惯数量 | 用户当前活跃的习惯数量（is_active=1） |
| microBehaviorCount | Long | 微行为数量 | 用户当前活跃的微行为数量（is_active=1） |
| checkInCount | Long | 打卡次数 | 用户从注册以来的总打卡次数 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPoints": 100,
    "availablePoints": 80,
    "level": 1,
    "habitCount": 3,
    "microBehaviorCount": 8,
    "checkInCount": 50
  }
}
```

**字段详细说明：**

1. **totalPoints（累计积分）**
   - 用户从注册以来获得的所有积分总和
   - 每次打卡时增加
   - 用于显示用户的总成就

2. **availablePoints（可用积分）**
   - 用户当前可以用来兑换奖励的积分
   - 计算公式：`availablePoints = totalPoints - 已兑换奖励消耗的积分`
   - 打卡时增加，兑换奖励时减少

3. **level（用户等级）**
   - 用户当前的等级，默认为 1
   - 可根据积分或其他规则升级

4. **habitCount（习惯数量）**
   - 统计用户当前活跃的习惯数量
   - 只统计 `is_active = 1` 的习惯
   - 包括自己创建的和从习惯库添加的习惯

5. **microBehaviorCount（微行为数量）**
   - 统计用户当前活跃的微行为数量
   - 只统计 `is_active = 1` 的微行为

6. **checkInCount（打卡次数）**
   - 用户从注册以来的总打卡次数
   - 统计所有打卡记录

### 6.2 获取今日打卡数据（发光时刻）

`GET /api/stats/today-checkins/{userId}`

**说明：** 获取用户今天的所有打卡记录，用于展示"今日发光时刻"

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| userId | Long | 用户ID |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "icon": "💧",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "checkedAt": "2026-01-18T08:30:00",
      "pointsEarned": 1
    },
    {
      "icon": "🛏️",
      "behavior": "整理被褥",
      "celebration": "心里说太棒了",
      "checkedAt": "2026-01-18T07:15:00",
      "pointsEarned": 1
    }
  ]
}
```

**返回字段说明：**
| 字段名 | 类型 | 说明 |
|-------|------|------|
| icon | String | 微行为图标 |
| behavior | String | 行为描述 |
| celebration | String | 庆祝方式 |
| checkedAt | DateTime | 打卡时间（ISO8601 格式） |
| pointsEarned | Integer | 本次打卡获得的积分 |

**注意事项：**
- 返回数据按打卡时间倒序排列（最新的在前）
- 只返回今天（00:00:00 到 23:59:59）的打卡记录
- 如果今天没有打卡，返回空数组

---

## 7. 模板库模块 `/api/library`

### 7.1 获取习惯库列表

`GET /api/library/habits`

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| category | String | 否 | 分类筛选：推荐/健康/学习/生活/心理/社交 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "category": "推荐",
      "name": "多喝水",
      "icon": "💧",
      "description": "每天8杯水",
      "suggestedAnchors": "[\"起床后\",\"到公司后\"]",
      "suggestedBehaviors": "[\"喝一口水\",\"喝半杯水\"]",
      "suggestedCelebrations": "[\"对自己微笑\"]",
      "difficulty": "easy",
      "isSystem": true,
      "popularity": 100
    }
  ]
}
```

### 7.2 获取配方模板列表

`GET /api/library/recipes` （需要认证）

**说明：** 
- 仅供已登录用户使用
- 返回配方列表，包含 `isAdded` 字段，标识用户是否已添加该配方
- 未登录用户不调用此接口，使用本地 AsyncStorage 存储的数据

**请求头：**
```
Authorization: Bearer <token>
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| category | String | 否 | 分类筛选 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "category": "推荐",
      "name": "晨起喝水",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "isSystem": true,
      "popularity": 100,
      "isAdded": true
    },
    {
      "id": 2,
      "category": "推荐",
      "name": "整理被褥",
      "icon": "🛏️",
      "anchor": "双脚落地后",
      "behavior": "整理被褥",
      "celebration": "心里说太棒了",
      "difficulty": "easy",
      "isSystem": true,
      "popularity": 95,
      "isAdded": false
    }
  ]
}
```

### 7.3 获取配方模板列表（已登录用户 - 旧接口，保留兼容）

`GET /api/library/recipes/with-status` （需要认证）

**说明：** 供已登录用户使用，包含 `isAdded` 字段，标识用户是否已添加该配方

**请求头：**
```
Authorization: Bearer <token>
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| category | String | 否 | 分类筛选 |

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "category": "推荐",
      "name": "晨起喝水",
      "icon": "💧",
      "anchor": "起床后",
      "behavior": "喝一口水",
      "celebration": "对自己微笑",
      "difficulty": "easy",
      "isSystem": true,
      "popularity": 100,
      "isAdded": true
    },
    {
      "id": 2,
      "category": "推荐",
      "name": "整理被褥",
      "icon": "🛏️",
      "anchor": "双脚落地后",
      "behavior": "整理被褥",
      "celebration": "心里说太棒了",
      "difficulty": "easy",
      "isSystem": true,
      "popularity": 95,
      "isAdded": false
    }
  ]
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| isAdded | Boolean | 当前用户是否已添加该配方到微行为列表 |

**实现原理：**
- 通过 `micro_behavior.source_template_id` 字段关联配方模板
- 查询当前用户已添加的模板ID集合
- 标记每个模板的 `isAdded` 状态

---

## 8. 微行为模块补充

### 8.1 从模板添加微行为

`POST /api/micro-behavior/add-from-template` （需要认证）

**说明：** 从配方库添加微行为到用户列表，会记录 `source_template_id` 用于追溯来源

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "templateId": 1,
  "frequency": "[1,2,3,4,5,6,7]",
  "reminderEnabled": false,
  "reminderTime": null
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| templateId | Long | 是 | 配方模板ID |
| frequency | String | 否 | 频率设置（JSON数组字符串），默认每天 |
| reminderEnabled | Boolean | 否 | 是否启用提醒，默认false |
| reminderTime | String | 否 | 提醒时间（HH:mm:ss格式） |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "userId": 1,
    "habitId": null,
    "sourceTemplateId": 1,
    "name": "晨起喝水",
    "icon": "💧",
    "anchor": "起床后",
    "behavior": "喝一口水",
    "celebration": "对自己微笑",
    "difficulty": "easy",
    "frequency": "[1,2,3,4,5,6,7]",
    "reminderEnabled": false,
    "reminderTime": null,
    "sortOrder": 0,
    "isActive": true,
    "createdAt": "2026-01-18T10:30:00"
  }
}
```

**错误响应：**
```json
{
  "code": 404,
  "message": "配方模板不存在",
  "data": null
}
```

---

## 9. 文件上传模块 `/api/file`

### 9.1 上传文件

`POST /api/file/upload` （无需认证）

**功能说明：**
- 上传图片文件（头像、图标等）
- 支持的格式：jpg、jpeg、png、gif、webp等图片格式
- 文件大小限制：最大5MB
- 返回可访问的URL

**请求格式：** `multipart/form-data`

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| file | File | 是 | 图片文件 |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "http://localhost:8081/uploads/a1b2c3d4-e5f6-g7h8-i9j0.jpg",
    "filename": "a1b2c3d4-e5f6-g7h8-i9j0.jpg",
    "originalFilename": "avatar.jpg",
    "size": "102400",
    "contentType": "image/jpeg"
  }
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| url | String | 文件访问URL（可直接用于avatarUrl） |
| filename | String | 服务器保存的文件名（UUID） |
| originalFilename | String | 原始文件名 |
| size | String | 文件大小（字节） |
| contentType | String | 文件MIME类型 |

**错误响应：**
```json
{
  "code": 400,
  "message": "文件不能为空",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "只支持图片格式",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "文件大小不能超过5MB",
  "data": null
}
```

**使用示例（curl）：**
```bash
curl -X POST http://localhost:8081/api/file/upload \
  -F "file=@/path/to/avatar.jpg"
```

**使用示例（JavaScript/Fetch）：**
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:8081/api/file/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.data.url); // 获取URL
```

**使用示例（React Native/Expo）：**
```javascript
import * as ImagePicker from 'expo-image-picker';

// 1. 选择图片
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

if (!result.canceled) {
  // 2. 上传图片
  const formData = new FormData();
  formData.append('file', {
    uri: result.assets[0].uri,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  });

  const uploadResponse = await fetch('http://localhost:8081/api/file/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const uploadResult = await uploadResponse.json();
  const avatarUrl = uploadResult.data.url;

  // 3. 更新用户资料
  await fetch('http://localhost:8081/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      avatarUrl: avatarUrl,
    }),
  });
}
```

### 9.2 删除文件

`DELETE /api/file/delete` （无需认证）

**功能说明：**
- 删除已上传的文件
- 需要提供文件名（不是完整URL）

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| filename | String | 是 | 文件名（从上传接口返回的filename） |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应：**
```json
{
  "code": 404,
  "message": "文件不存在",
  "data": null
}
```

---

## 错误码说明

### 标准HTTP状态码

| code | 说明 | 使用场景 | 示例 |
|------|------|---------|------|
| 200 | 成功 | 请求成功处理 | 登录成功、创建成功、查询成功 |
| 400 | 请求参数错误 | 参数缺失、格式错误、类型错误 | 文件类型不支持、文件过大、必填参数缺失 |
| 401 | 未授权 | Token无效、Token过期、未登录 | Token过期、Token格式错误、未提供Token |
| 402 | 账号已存在 | 注册时账号重复 | 邮箱已被注册、手机号已被注册 |
| 403 | 禁止操作 | 无权限、操作被拒绝 | 删除系统习惯、操作他人数据、权限不足 |
| 404 | 资源不存在 | 请求的资源不存在 | 习惯不存在、微行为不存在、用户不存在 |
| 405 | 账号或密码错误 | 登录失败 | 密码错误、账号不存在 |
| 406 | 两次密码不一致 | 密码确认失败 | 重置密码时两次输入不一致 |
| 407 | 账号格式错误 | 账号格式不正确 | 邮箱格式错误、手机号格式错误 |
| 409 | 重复操作 | 操作冲突 | 今天已经打卡过了、重复提交 |
| 500 | 服务器内部错误 | 未预期的错误 | 数据库错误、系统异常 |

### 错误响应格式

所有错误响应都遵循统一格式：

```json
{
  "code": 错误码,
  "message": "错误描述",
  "data": null
}
```

### 常见错误示例

#### 1. 参数错误 (400)
```json
{
  "code": 400,
  "message": "文件不能为空",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "只支持图片格式",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "文件大小不能超过5MB",
  "data": null
}
```

#### 2. 未授权 (401)
```json
{
  "code": 401,
  "message": "Token无效或已过期",
  "data": null
}
```

#### 3. 禁止操作 (403)
```json
{
  "code": 403,
  "message": "系统推荐的习惯不能删除",
  "data": null
}
```

```json
{
  "code": 403,
  "message": "无权操作该资源",
  "data": null
}
```

#### 4. 资源不存在 (404)
```json
{
  "code": 404,
  "message": "习惯不存在或无权操作",
  "data": null
}
```

```json
{
  "code": 404,
  "message": "文件不存在",
  "data": null
}
```

#### 5. 登录失败 (405)
```json
{
  "code": 405,
  "message": "账号或密码错误",
  "data": null
}
```

#### 6. 密码不一致 (406)
```json
{
  "code": 406,
  "message": "两次密码不一致",
  "data": null
}
```

#### 7. 格式错误 (407)
```json
{
  "code": 407,
  "message": "账号格式错误",
  "data": null
}
```

#### 8. 重复操作 (409)
```json
{
  "code": 409,
  "message": "今天已经打卡过了",
  "data": null
}
```

#### 9. 服务器错误 (500)
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

---

## 时间格式说明

### 时间字段格式规范

| 字段类型 | 格式 | 示例 | 说明 |
|---------|------|------|------|
| createdAt | ISO8601 | `2026-01-17T10:30:00+08:00` | 创建时间，包含时区 |
| updatedAt | ISO8601 | `2026-01-17T10:30:00+08:00` | 更新时间，包含时区 |
| checkedAt | ISO8601 | `2026-01-17T08:30:00+08:00` | 打卡时间，包含时区 |
| reminderTime | HH:mm:ss | `07:00:00` | 提醒时间，24小时制 |
| redeemed_at | ISO8601 | `2026-01-17T15:00:00+08:00` | 兑换时间，包含时区 |
| unlocked_at | ISO8601 | `2026-01-17T12:00:00+08:00` | 解锁时间，包含时区 |

### ISO8601格式说明

**格式：** `YYYY-MM-DDTHH:mm:ss+时区`

**示例：**
- `2026-01-17T10:30:00+08:00` - 北京时间 2026年1月17日 10:30:00
- `2026-01-17T02:30:00Z` - UTC时间 2026年1月17日 02:30:00

**前端解析：**
```javascript
// JavaScript
const date = new Date("2026-01-17T10:30:00+08:00");
console.log(date.toLocaleString()); // 自动转换为本地时间

// React Native
import { format } from 'date-fns';
const formattedDate = format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss');
```

### reminderTime格式说明

**格式：** `HH:mm:ss` (24小时制)

**示例：**
- `07:00:00` - 早上7点
- `13:30:00` - 下午1点30分
- `23:59:59` - 晚上11点59分59秒

**前端处理：**
```javascript
// 如果前端使用 HH:mm 格式，需要补充秒数
const reminderTime = "07:00"; // 前端输入
const fullTime = reminderTime + ":00"; // 发送给后端

// 或者后端兼容处理（推荐）
// 后端接收 "07:00" 或 "07:00:00" 都可以
```

**后端兼容处理建议：**
```java
// 兼容 HH:mm 和 HH:mm:ss 两种格式
String time = request.getReminderTime();
if (time != null && !time.isEmpty()) {
    if (time.length() == 5) {
        time = time + ":00"; // 补充秒数
    }
    microBehavior.setReminderTime(LocalTime.parse(time));
}
```

---

## 安全建议

### ⚠️ userId参数安全风险

**当前问题：** 部分接口允许客户端传递userId，存在越权风险。

**存在风险的接口：**
```
GET /api/habit/user/{userId}/micro-behaviors
GET /api/checkin/user/{userId}
GET /api/checkin/today/{userId}
POST /api/checkin (body含userId)
GET /api/reward/user/{userId}
GET /api/stats/user/{userId}
```

**风险说明：**
恶意用户可以修改userId参数，访问其他用户的数据。

**建议：**
1. 所有用户相关接口应从JWT Token中获取userId
2. 不要信任客户端传递的userId
3. 使用 `@RequestAttribute("userId")` 从拦截器获取

**示例：**
```java
// ❌ 不安全
@GetMapping("/user/{userId}/micro-behaviors")
public Result<List<MicroBehavior>> getByUserId(@PathVariable Long userId) {
    // 客户端可以修改userId访问其他用户数据
}

// ✅ 安全
@GetMapping("/my-micro-behaviors")
public Result<List<MicroBehavior>> getMyMicroBehaviors(
        @RequestAttribute("userId") Long userId) {
    // userId从JWT Token获取，无法伪造
}
```

**前端调用：**
```javascript
// ❌ 不安全的调用
fetch(`/api/habit/user/${userId}/micro-behaviors`)

// ✅ 安全的调用
fetch('/api/habit/my-micro-behaviors', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## API版本规划

当前版本：**v1.0**

计划版本：**v2.0** （包含安全性改进）

详见：`docs/API_CHANGES_v2.md`
