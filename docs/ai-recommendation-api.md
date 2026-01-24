# AI 推荐功能 API 文档

## 概述

使用智谱 AI GLM-4-Flash 模型提供智能推荐功能，帮助用户更好地养成习惯。

## 接口列表

### 1. 推荐微行为

`POST /api/ai/recommend/micro-behaviors`

**功能说明：** 根据用户的习惯目标，推荐具体的微行为

**请求参数：**
```json
{
  "habitName": "多喝水",
  "habitCategory": "健康",
  "userContext": "上班族，经常忘记喝水"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| habitName | String | 是 | 习惯名称 |
| habitCategory | String | 否 | 习惯分类（健康/学习/运动/生活/心理/社交） |
| userContext | String | 否 | 用户背景信息 |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "[{\"name\":\"穿上跑鞋\",\"behavior\":\"穿上鞋\",\"description\":\"启动门槛低，无需高动机，方便启动跑步行为\",\"difficulty\":\"easy\",\"estimatedTime\":\"30秒\",\"icon\":\"👟\"}...]"
}
```

**注意：** `data` 是 JSON 字符串，需要用 `JSON.parse()` 解析！返回 6 个微行为。

**返回的 JSON 数组格式：**
```json
[
  {
    "name": "穿上跑鞋",
    "behavior": "穿上鞋",
    "description": "启动门槛低，无需高动机，方便启动跑步行为",
    "difficulty": "easy",
    "estimatedTime": "30秒",
    "icon": "👟"
  },
  {
    "name": "热身走步",
    "behavior": "走5分钟",
    "description": "简单易行，无需高动机，为跑步做准备",
    "difficulty": "easy",
    "estimatedTime": "5分钟",
    "icon": "🚶‍♂️"
  },
  {
    "name": "跑步1公里",
    "behavior": "跑1公里",
    "description": "小步快跑，建立信心，逐步接近目标",
    "difficulty": "medium",
    "estimatedTime": "8分钟",
    "icon": "🏃"
  },
  {
    "name": "跑步2公里",
    "behavior": "跑2公里",
    "description": "适度挑战，提升运动能力，逐步增加距离",
    "difficulty": "medium",
    "estimatedTime": "15分钟",
    "icon": "🏃‍♀️"
  },
  {
    "name": "跑步3公里",
    "behavior": "跑3公里",
    "description": "接近目标，提升运动习惯，适合已有基础的用户",
    "difficulty": "hard",
    "estimatedTime": "20分钟",
    "icon": "🏃‍♂️"
  }
]
```

**难度级别说明：**
- **easy**：30秒-2分钟，超级简单的启动行为，零动机门槛
- **medium**：5-10分钟，适度挑战，比最终目标更小但仍有意义
- **hard**：10-20分钟，接近目标，适合已有基础的用户

**字段说明：**
| 字段 | 类型 | 说明 |
|-----|------|------|
| name | String | 微行为名称（简洁有力） |
| behavior | String | 具体行为（10字以内，动词开头） |
| description | String | 设计理由（基于 B=MAP 模型解释为什么这个设计有效，50字以内） |
| difficulty | String | 难度等级（easy/medium/hard） |
| estimatedTime | String | 预计完成时间（如：30秒、2分钟、5分钟、10分钟） |
| icon | String | emoji 图标 |

### 2. 推荐锚点

`POST /api/ai/recommend/anchors`

**功能说明：** 根据用户的习惯，推荐合适的锚点行为

**请求参数：**
```json
{
  "habitName": "阅读",
  "timeOfDay": "晚上",
  "userContext": "想要养成每天阅读的习惯"
}
```

**字段说明：**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| habitName | String | 是 | 习惯名称 |
| timeOfDay | String | 否 | 时间段（早上/中午/下午/晚上） |
| userContext | String | 否 | 用户背景信息 |

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "[{\"anchor\":\"起床后\",\"description\":\"每天都会发生，时间固定，是开始新习惯的好时机\",\"timeOfDay\":\"早上\",\"icon\":\"🌅\"}...]"
}
```

**注意：** `data` 是 JSON 字符串，需要用 `JSON.parse()` 解析！返回 6 个锚点。

**返回的 JSON 数组格式：**
```json
[
  {
    "anchor": "刷完牙后",
    "description": "高频率（每天2次）、时间固定、易识别，是理想的习惯触发点",
    "timeOfDay": "早上",
    "icon": "🪥"
  },
  {
    "anchor": "吃完早饭后",
    "description": "每天必做，时间相对固定，适合开始晨间习惯",
    "timeOfDay": "早上",
    "icon": "🍳"
  },
  {
    "anchor": "午休结束后",
    "description": "精神恢复，适合开始下午的习惯养成",
    "timeOfDay": "下午",
    "icon": "☕"
  },
  {
    "anchor": "吃完晚饭后",
    "description": "每天必做，时间相对固定，适合开始晚间习惯",
    "timeOfDay": "晚上",
    "icon": "🍽️"
  },
  {
    "anchor": "洗完澡后",
    "description": "放松状态，适合开始睡前习惯",
    "timeOfDay": "晚上",
    "icon": "🚿"
  }
]
```

## 提示词设计

### 推荐微行为提示词

基于斯坦福大学 B.J. Fogg 博士的《福格行为模型》（Tiny Habits）理论设计。

**核心理念：B=MAP（行为=动机×能力×提示）**

**角色定位：** 顶级行为设计专家（Master Behavior Design Specialist）

**设计原则：**
1. **降低能力门槛（Ability）**：提供不同难度层级的微行为
   - easy：30秒-2分钟（如穿跑鞋、走出门）
   - medium：5-10分钟（如跑1公里、读5页书）
   - hard：10-20分钟（如跑3公里、读15页书）
2. **无需高动机（Motivation）**：即使动机较低时也能完成
3. **具体可执行（Specific）**：避免模糊描述，给出精确的行为指令
4. **可测量（Measurable）**：用户能清楚知道自己是否完成了
5. **渐进式（Progressive）**：用户可以从 easy 开始，逐步提升

**输出要求：**
- 推荐 6 个不同难度的微行为
- 必须按难度从低到高排序（easy → medium → hard）
- 至少包含 2 个 easy 级别（超级简单的启动行为）
- 至少包含 2 个 medium 级别（适度挑战的行为）
- 至少包含 2 个 hard 级别（接近目标的行为）
- 直接返回 JSON 数组，不要 markdown 代码块包裹
- 每个微行为的 description 必须体现 B=MAP 模型的思考

**返回示例：**
```json
[
  {
    "name": "穿上跑鞋",
    "behavior": "穿上鞋",
    "description": "启动门槛低，无需高动机，方便启动跑步行为",
    "difficulty": "easy",
    "estimatedTime": "30秒",
    "icon": "👟"
  },
  {
    "name": "跑步1公里",
    "behavior": "跑1公里",
    "description": "小步快跑，建立信心，逐步接近目标",
    "difficulty": "medium",
    "estimatedTime": "8分钟",
    "icon": "🏃"
  },
  {
    "name": "跑步3公里",
    "behavior": "跑3公里",
    "description": "接近目标，提升运动习惯，适合已有基础的用户",
    "difficulty": "hard",
    "estimatedTime": "20分钟",
    "icon": "🏃‍♂️"
  }
]
```

### 推荐锚点提示词

基于福格行为模型的「锚点理论」（Anchor）设计。

**角色定位：** 顶级行为设计专家（Master Behavior Design Specialist）

**⚠️ 关键规则（必须遵守）：**
1. **场景匹配**：锚点必须与习惯的【执行场景】相匹配
2. **已有行为**：锚点必须是用户【已有的日常行为】，而非新行为
3. **时空适配**：锚点发生的【时间和地点】必须适合执行该习惯
4. **状态适配**：锚点后的身体和心理状态必须适合执行该习惯

**🚫 错误示例（跑步习惯）：**
- ❌ 睡前准备后 → 睡前不适合跑步（时间不匹配）
- ❌ 看电视时 → 看电视时无法跑步（场景冲突）
- ❌ 听音乐时 → 太宽泛，不是具体锚点（不够具体）
- ❌ 开始跑步前 → 这是新行为，不是已有锚点（循环定义）

**✅ 正确示例（跑步习惯）：**
- ✓ 起床穿好衣服后 → 早晨适合晨跑，状态清醒
- ✓ 下班回家换好运动服后 → 傍晚适合跑步，有时间
- ✓ 午休结束后 → 下午可以运动，精神恢复

**锚点推荐逻辑：**
1. **分析习惯的最佳执行时间**（早上/下午/晚上）
2. **分析习惯的执行地点要求**（室内/室外/健身房/办公室）
3. **分析习惯的前置准备**（换衣服/准备器材/清空时间）
4. **匹配用户在该时间段的已有行为**作为锚点

**习惯分类与锚点建议：**
- **运动类**（跑步/健身/瑜伽）→ 换好运动服后、起床后、下班回家后、午休结束后
- **阅读类**（看书/学习）→ 睡前躺下后、午休时、通勤坐下后、晚饭后
- **冥想类**（冥想/放松）→ 起床后、午饭后、睡前、洗完澡后
- **学习类**（学习/工作）→ 到办公室后、打开电脑后、午休后、晚饭后
- **饮水类**（喝水/补水）→ 起床后、到公司后、每次上完厕所后、吃完饭后
- **整理类**（收拾/清洁）→ 起床后、下班回家后、睡前、周末早上

**锚点选择标准：**
1. **高频率（Frequency）**：用户每天都会做的固定行为
2. **可预测（Predictability）**：发生时间和地点相对固定
3. **易识别（Recognizability）**：用户能立即意识到这个时刻
4. **自然关联（Natural Connection）**：与目标习惯有逻辑或情境上的联系
5. **情绪中性（Emotional Neutrality）**：不是在压力或负面情绪下发生的行为

**输出要求：**
- 推荐 6 个合适的锚点
- 覆盖一天中的不同时间段（早上/中午/下午/晚上）
- 确保时间、地点、状态都与习惯执行相匹配
- 优先推荐用户每天必做的「仪式性行为」
- 直接返回 JSON 数组，不要 markdown 代码块包裹
- 每个锚点都要体现福格理论的核心原则
- 避免推荐需要额外记忆或提醒的行为
- 避免推荐与习惯执行场景冲突的锚点

**返回示例（跑步习惯）：**
```json
[
  {
    "anchor": "起床穿好衣服后",
    "description": "早晨精神状态好，适合晨跑，时间充裕",
    "timeOfDay": "早上",
    "icon": "👕"
  },
  {
    "anchor": "下班换好运动服后",
    "description": "傍晚时间灵活，换好衣服后可直接出门跑步",
    "timeOfDay": "晚上",
    "icon": "👟"
  }
]
```

## 使用示例

### cURL 示例

**推荐微行为：**
```bash
curl -X POST http://localhost:8081/api/ai/recommend/micro-behaviors \
  -H "Content-Type: application/json" \
  -d '{
    "habitName": "多喝水",
    "habitCategory": "健康",
    "userContext": "上班族，经常忘记喝水"
  }'
```

**推荐锚点：**
```bash
curl -X POST http://localhost:8081/api/ai/recommend/anchors \
  -H "Content-Type: application/json" \
  -d '{
    "habitName": "阅读",
    "timeOfDay": "晚上",
    "userContext": "想要养成每天阅读的习惯"
  }'
```

### JavaScript 示例

```javascript
// 推荐微行为
async function recommendMicroBehaviors() {
  const response = await fetch('http://localhost:8081/api/ai/recommend/micro-behaviors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      habitName: '多喝水',
      habitCategory: '健康',
      userContext: '上班族，经常忘记喝水'
    })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    const recommendations = JSON.parse(result.data);
    console.log(recommendations);
  }
}

// 推荐锚点
async function recommendAnchors() {
  const response = await fetch('http://localhost:8081/api/ai/recommend/anchors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      habitName: '阅读',
      timeOfDay: '晚上',
      userContext: '想要养成每天阅读的习惯'
    })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    const recommendations = JSON.parse(result.data);
    console.log(recommendations);
  }
}
```

## 注意事项

1. **响应时间**：AI 推荐需要 2-5 秒，前端需要显示加载状态
2. **JSON 解析**：返回的 data 是 JSON 字符串，需要 `JSON.parse()` 解析
3. **JSON 清理**：后端已自动清理 markdown 代码块标记（```json），确保返回纯 JSON
4. **难度排序**：微行为推荐结果已按难度从低到高排序（easy → medium → hard）
5. **错误处理**：AI 可能返回非 JSON 格式，需要做容错处理
6. **用户体验**：建议缓存推荐结果，避免频繁调用
7. **API 限制**：注意 API 调用频率限制

## 理论基础

本功能基于斯坦福大学 B.J. Fogg 博士的《福格行为模型》（Tiny Habits）理论：

**B=MAP 模型：**
- **B（Behavior）**：行为
- **M（Motivation）**：动机
- **A（Ability）**：能力
- **P（Prompt）**：提示

**核心原则：**
1. 降低能力门槛，让行为变得超级简单
2. 不依赖高动机，即使动机低也能完成
3. 使用锚点（现有习惯）触发新习惯
4. 渐进式提升，从微小行为开始

**为什么有效：**
- 微行为降低了心理门槛，更容易开始
- 成功完成微行为会带来成就感，形成正向循环
- 锚点利用现有习惯，减少记忆负担
- 渐进式提升避免了一次性改变带来的压力

## 配置信息

- **模型**：glm-4-flash
- **API Key**：配置在 `application.yml` 中
- **最大 Token**：1024
- **Temperature**：0.7

## 相关文件

- `src/main/java/com/tinyhabits/service/AiService.java` - 服务接口
- `src/main/java/com/tinyhabits/service/impl/AiServiceImpl.java` - 服务实现
- `src/main/java/com/tinyhabits/controller/AiController.java` - 控制器
- `src/main/resources/application.yml` - 配置文件

## 更新日期

2026-01-22

## 更新记录

**v1.4 (2026-01-22)**
- ✅ 调整推荐数量：微行为 6 个，锚点 6 个
- ✅ 微行为要求：至少 2 个 easy、2 个 medium、2 个 hard
- ✅ 锚点要求：覆盖一天中的不同时间段

**v1.3 (2026-01-22)**
- ✅ 优化锚点推荐提示词，确保场景匹配
- ✅ 添加关键规则：锚点必须与习惯的执行场景相匹配
- ✅ 添加错误示例和正确示例对比
- ✅ 添加习惯分类与锚点建议（运动/阅读/冥想/学习/饮水/整理）
- ✅ 强调时间、地点、状态的适配性

**v1.2 (2026-01-22)**
- ✅ 新增 estimatedTime 字段，AI 自动估算每个微行为的完成时间
- ✅ 优化提示词，要求 AI 根据难度级别给出合理的时间估算
- ✅ 更新文档和示例，包含时间估算信息

**v1.1 (2026-01-22)**
- ✅ 优化提示词设计，基于福格行为模型（B=MAP）
- ✅ 实现 JSON 自动清理，去除 markdown 代码块标记
- ✅ 微行为推荐按难度排序（easy → medium → hard）
- ✅ 明确难度级别定义（easy: 30秒-2分钟，medium: 5-10分钟，hard: 10-20分钟）
- ✅ 更新 API 文档，添加理论基础说明

**v1.0 (2026-01-21)**
- 初始版本，实现基础推荐功能
