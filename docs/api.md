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
- 删除用户的习惯
- 会同时删除该习惯下的所有微行为
- 适用于用户想要批量清理不需要的习惯

**路径参数：**
| 参数 | 类型 | 说明 |
|-----|------|------|
| id | Long | 习惯ID |

**注意事项：**
- ⚠️ 删除习惯会同时删除该习惯下的所有微行为
- ⚠️ 删除操作为软删除，数据不会真正丢失
- ⚠️ 只能删除自己的习惯

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
  "message": "习惯不存在或无权操作",
  "data": null
}
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
- 每次打卡获得 1 个行动值
- 同一微行为每天只能打卡一次

**请求参数：**
```json
{
  "microBehaviorId": 1,
  "habitId": 1
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| microBehaviorId | Long | 是 | 微行为ID |
| habitId | Long | 是 | 习惯ID |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "microBehaviorId": 1,
    "habitId": 1,
    "userId": 1,
    "checkedAt": "2026-01-17T08:30:00",
    "pointsEarned": 1
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

### 4.2 获取用户打卡记录

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
      "checkedAt": "2026-01-17T08:30:00",
      "pointsEarned": 1
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

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPoints": 100,
    "availablePoints": 80,
    "habitCount": 3,
    "microBehaviorCount": 8,
    "totalCheckIns": 50,
    "todayCheckIns": 3,
    "currentStreak": 7,
    "longestStreak": 15
  }
}
```

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

`GET /api/library/recipes`

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
      "popularity": 100
    }
  ]
}
```

---

## 错误码说明

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或Token无效 |
| 402 | 账号已存在 |
| 403 | 账号不存在 |
| 404 | 资源不存在 |
| 405 | 账号或密码错误 |
| 406 | 两次密码不一致 |
| 407 | 账号格式错误 |
| 500 | 服务器内部错误 |
