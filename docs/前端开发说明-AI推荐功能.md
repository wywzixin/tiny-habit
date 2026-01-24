# 前端开发说明 - AI 推荐功能

## 📢 功能已完成

AI 推荐功能的后端接口已经开发完成并测试通过，现在需要前端实现对接。

---

## 🎯 需要实现的功能

### 1. AI 推荐微行为
在创建配方页面，当用户输入习惯名称后，提供"AI 推荐"按钮，帮助用户快速获取微行为建议。

### 2. AI 推荐锚点
在创建配方页面，当用户需要选择锚点时，提供"AI 推荐"按钮，帮助用户选择合适的触发时机。

---

## 📡 接口信息

### 接口 1：推荐微行为

**接口地址：** `POST http://192.168.10.64:8081/api/ai/recommend/micro-behaviors`

**无需认证**（不需要传 Token）

**请求参数：**
```json
{
  "habitName": "跑步5公里",
  "habitCategory": "运动",
  "userContext": "想养成跑步习惯，但经常没动力"
}
```

**参数说明：**
- `habitName`（必填）：习惯名称，比如"跑步5公里"、"多喝水"、"阅读"
- `habitCategory`（可选）：习惯分类，可选值：健康/学习/运动/生活/心理/社交
- `userContext`（可选）：用户背景信息，帮助 AI 提供更精准的推荐

**返回示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": "[{\"name\":\"穿上跑鞋\",\"behavior\":\"穿上鞋\",\"description\":\"启动门槛低，无需高动机，方便启动跑步行为\",\"difficulty\":\"easy\",\"icon\":\"👟\"},{\"name\":\"热身走步\",\"behavior\":\"走5分钟\",\"description\":\"简单易行，无需高动机，为跑步做准备\",\"difficulty\":\"easy\",\"icon\":\"🚶‍♂️\"},{\"name\":\"跑步1公里\",\"behavior\":\"跑1公里\",\"description\":\"小步快跑，建立信心，逐步接近目标\",\"difficulty\":\"medium\",\"icon\":\"🏃\"},{\"name\":\"跑步2公里\",\"behavior\":\"跑2公里\",\"description\":\"适度挑战，提升运动能力，逐步增加距离\",\"difficulty\":\"medium\",\"icon\":\"🏃‍♀️\"},{\"name\":\"跑步3公里\",\"behavior\":\"跑3公里\",\"description\":\"接近目标，提升运动习惯，适合已有基础的用户\",\"difficulty\":\"hard\",\"icon\":\"🏃‍♂️\"}]"
}
```

**注意：** `data` 是 JSON 字符串，需要用 `JSON.parse()` 解析！

**解析后的数据格式：**
```json
[
  {
    "name": "穿上跑鞋",
    "behavior": "穿上鞋",
    "description": "启动门槛低，无需高动机，方便启动跑步行为",
    "difficulty": "easy",
    "icon": "👟"
  },
  {
    "name": "跑步1公里",
    "behavior": "跑1公里",
    "description": "小步快跑，建立信心，逐步接近目标",
    "difficulty": "medium",
    "icon": "🏃"
  },
  {
    "name": "跑步3公里",
    "behavior": "跑3公里",
    "description": "接近目标，提升运动习惯，适合已有基础的用户",
    "difficulty": "hard",
    "icon": "🏃‍♂️"
  }
]
```

---

### 接口 2：推荐锚点

**接口地址：** `POST http://192.168.10.64:8081/api/ai/recommend/anchors`

**无需认证**（不需要传 Token）

**请求参数：**
```json
{
  "habitName": "阅读",
  "timeOfDay": "晚上",
  "userContext": "想每天阅读，但总是忘记"
}
```

**参数说明：**
- `habitName`（必填）：习惯名称
- `timeOfDay`（可选）：时间段，可选值：早上/中午/下午/晚上
- `userContext`（可选）：用户背景信息

**返回示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": "[{\"anchor\":\"刷完牙后\",\"description\":\"高频率（每天2次）、时间固定、易识别，是理想的习惯触发点\",\"timeOfDay\":\"早上\",\"icon\":\"🪥\"},{\"anchor\":\"吃完晚饭后\",\"description\":\"每天必做，时间相对固定，适合开始晚间习惯\",\"timeOfDay\":\"晚上\",\"icon\":\"🍽️\"}]"
}
```

**解析后的数据格式：**
```json
[
  {
    "anchor": "刷完牙后",
    "description": "高频率（每天2次）、时间固定、易识别，是理想的习惯触发点",
    "timeOfDay": "早上",
    "icon": "🪥"
  },
  {
    "anchor": "吃完晚饭后",
    "description": "每天必做，时间相对固定，适合开始晚间习惯",
    "timeOfDay": "晚上",
    "icon": "🍽️"
  }
]
```

---

## 🎨 UI 设计要求

### 1. 微行为推荐展示

**重要：必须按难度排序显示，并显示难度标签！**

**难度级别说明：**
| 难度 | 英文 | 中文显示 | 颜色建议 | 说明 |
|-----|------|---------|---------|------|
| easy | easy | 简单 | 绿色 #4CAF50 | 30秒-2分钟，超级简单的启动行为 |
| medium | medium | 中等 | 橙色 #FF9800 | 5-10分钟，适度挑战 |
| hard | hard | 困难 | 红色 #F44336 | 10-20分钟，接近目标 |

**展示要求：**
1. ✅ **必须按难度排序**：easy → medium → hard（后端已排序，直接展示即可）
2. ✅ **必须显示难度标签**：每个微行为卡片上显示难度徽章
3. ✅ **显示图标**：使用 emoji 图标
4. ✅ **显示描述**：显示 AI 的推荐理由

**推荐的卡片布局：**
```
┌─────────────────────────────────────┐
│ 👟 穿上跑鞋              [简单]     │
│ 穿上鞋                              │
│ 启动门槛低，无需高动机，方便启动... │
│                          [选择此项] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🏃 跑步1公里             [中等]     │
│ 跑1公里                             │
│ 小步快跑，建立信心，逐步接近目标    │
│                          [选择此项] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🏃‍♂️ 跑步3公里            [困难]     │
│ 跑3公里                             │
│ 接近目标，提升运动习惯，适合已有... │
│                          [选择此项] │
└─────────────────────────────────────┘
```

### 2. 锚点推荐展示

**展示要求：**
1. 显示图标和锚点名称
2. 显示时间段标签（早上/中午/下午/晚上）
3. 显示推荐理由
4. 可以按时间段分组显示

**推荐的卡片布局：**
```
┌─────────────────────────────────────┐
│ 🪥 刷完牙后              [早上]     │
│ 高频率（每天2次）、时间固定、易识别 │
│                          [选择此项] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🍽️ 吃完晚饭后            [晚上]     │
│ 每天必做，时间相对固定，适合开始... │
│                          [选择此项] │
└─────────────────────────────────────┘
```

---

## 💡 交互流程建议

### 创建配方页面流程

1. **用户输入习惯名称**
   - 输入框：请输入习惯名称（如：跑步5公里）

2. **点击"AI 推荐微行为"按钮**
   - 显示加载动画（AI 思考中...）
   - 调用推荐微行为接口
   - 等待 2-5 秒

3. **展示推荐结果**
   - 显示 3-5 个微行为卡片
   - **按难度排序显示**（easy → medium → hard）
   - **每个卡片显示难度标签**
   - 用户可以选择一个或多个

4. **点击"AI 推荐锚点"按钮**
   - 显示加载动画
   - 调用推荐锚点接口
   - 展示 5-8 个锚点选项

5. **用户选择后填充表单**
   - 自动填充微行为名称、行为、图标
   - 自动填充锚点
   - 用户可以继续编辑

---

## 📝 代码示例

### React Native 示例

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';

function AiRecommendation({ habitName, habitCategory, onSelectBehavior }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // 获取 AI 推荐
  const getRecommendations = async () => {
    if (!habitName.trim()) {
      alert('请先输入习惯名称');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.10.64:8081/api/ai/recommend/micro-behaviors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          habitName: habitName,
          habitCategory: habitCategory || '运动',
          userContext: '' // 可选
        })
      });

      const result = await response.json();
      if (result.code === 200) {
        // 重要：需要 JSON.parse 解析 data
        const data = JSON.parse(result.data);
        setRecommendations(data);
      } else {
        alert('推荐失败：' + result.message);
      }
    } catch (error) {
      console.error('推荐失败:', error);
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 难度标签样式
  const getDifficultyStyle = (difficulty) => {
    const styles = {
      easy: { backgroundColor: '#4CAF50', text: '简单' },
      medium: { backgroundColor: '#FF9800', text: '中等' },
      hard: { backgroundColor: '#F44336', text: '困难' }
    };
    return styles[difficulty] || styles.easy;
  };

  return (
    <View>
      {/* AI 推荐按钮 */}
      <TouchableOpacity 
        onPress={getRecommendations}
        disabled={loading}
        style={{ backgroundColor: '#667eea', padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          {loading ? 'AI 思考中...' : '🤖 AI 推荐微行为'}
        </Text>
      </TouchableOpacity>

      {/* 加载动画 */}
      {loading && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={{ marginTop: 10, color: '#666' }}>AI 正在为您生成推荐...</Text>
        </View>
      )}

      {/* 推荐结果列表 - 按难度排序显示 */}
      {!loading && recommendations.length > 0 && (
        <ScrollView style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            为您推荐 {recommendations.length} 个微行为
          </Text>
          
          {recommendations.map((item, index) => {
            const difficultyStyle = getDifficultyStyle(item.difficulty);
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => onSelectBehavior(item)}
                style={{
                  backgroundColor: 'white',
                  padding: 15,
                  marginBottom: 10,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                {/* 标题行：图标 + 名称 + 难度标签 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '600', flex: 1 }}>
                    {item.name}
                  </Text>
                  {/* 难度标签 - 必须显示！ */}
                  <View style={{
                    backgroundColor: difficultyStyle.backgroundColor,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      {difficultyStyle.text}
                    </Text>
                  </View>
                </View>

                {/* 行为描述 */}
                <Text style={{ fontSize: 16, color: '#667eea', marginBottom: 5 }}>
                  📝 {item.behavior}
                </Text>

                {/* AI 推荐理由 */}
                <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                  {item.description}
                </Text>

                {/* 选择按钮 */}
                <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                  <Text style={{ color: '#667eea', fontWeight: '600' }}>
                    选择此项 →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export default AiRecommendation;
```

### 使用示例

```javascript
// 在创建配方页面中使用
function CreateRecipePage() {
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('运动');
  const [selectedBehavior, setSelectedBehavior] = useState(null);

  const handleSelectBehavior = (behavior) => {
    // 用户选择了一个推荐的微行为
    setSelectedBehavior(behavior);
    
    // 自动填充表单
    // 你可以根据实际情况填充到对应的输入框
    console.log('选择的微行为:', behavior);
    // behavior.name - 微行为名称
    // behavior.behavior - 具体行为
    // behavior.icon - 图标
    // behavior.difficulty - 难度
  };

  return (
    <View>
      <TextInput
        placeholder="请输入习惯名称"
        value={habitName}
        onChangeText={setHabitName}
      />

      <AiRecommendation
        habitName={habitName}
        habitCategory={habitCategory}
        onSelectBehavior={handleSelectBehavior}
      />

      {selectedBehavior && (
        <View>
          <Text>已选择：{selectedBehavior.name}</Text>
          <Text>难度：{selectedBehavior.difficulty}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## ⚠️ 重要注意事项

### 1. JSON 解析
```javascript
// ❌ 错误：直接使用 result.data
const recommendations = result.data; // 这是字符串！

// ✅ 正确：需要 JSON.parse
const recommendations = JSON.parse(result.data);
```

### 2. 难度排序
```javascript
// ✅ 后端已经按难度排序，直接展示即可
// 顺序：easy → medium → hard
recommendations.map((item, index) => (
  <Card key={index} data={item} />
))

// ❌ 不需要前端再次排序
```

### 3. 难度标签显示
```javascript
// ✅ 必须显示难度标签
<View style={styles.difficultyBadge}>
  <Text>{item.difficulty === 'easy' ? '简单' : 
         item.difficulty === 'medium' ? '中等' : '困难'}</Text>
</View>

// ❌ 不要隐藏难度信息
```

### 4. 加载状态
```javascript
// ✅ 显示友好的加载提示
{loading && (
  <View>
    <ActivityIndicator />
    <Text>AI 正在为您生成推荐...</Text>
  </View>
)}

// ⏱️ AI 响应时间：2-5 秒，需要显示加载动画
```

### 5. 错误处理
```javascript
try {
  const response = await fetch(...);
  const result = await response.json();
  
  if (result.code === 200) {
    const data = JSON.parse(result.data);
    setRecommendations(data);
  } else {
    // 显示错误信息
    alert('推荐失败：' + result.message);
  }
} catch (error) {
  // 网络错误
  alert('网络错误，请重试');
}
```

---

## 🎯 开发检查清单

在提交代码前，请确认以下事项：

- [ ] 推荐微行为接口调用成功
- [ ] 推荐锚点接口调用成功
- [ ] 返回的 JSON 字符串已正确解析（使用 JSON.parse）
- [ ] **微行为列表按难度排序显示（easy → medium → hard）**
- [ ] **每个微行为卡片显示难度标签（简单/中等/困难）**
- [ ] **难度标签使用不同颜色区分（绿色/橙色/红色）**
- [ ] 显示 emoji 图标
- [ ] 显示 AI 推荐理由（description）
- [ ] 加载状态显示友好的提示信息
- [ ] 错误处理完善（网络错误、接口错误）
- [ ] 用户可以选择推荐的微行为/锚点
- [ ] 选择后自动填充到表单
- [ ] 用户可以继续编辑 AI 推荐的内容

---

## 📚 参考文档

- **完整 API 文档**：`docs/api.md` - 第 10 章节
- **详细 API 文档**：`docs/ai-recommendation-api.md`
- **测试页面**：`test-recommend.html`（可以在浏览器中打开测试）

---

## 🤝 联系方式

如有问题，请联系后端开发人员。

**测试地址：** http://192.168.10.64:8081

**接口状态：** ✅ 已完成并测试通过

**开发时间：** 2026-01-22

---

## 💪 加油！

AI 推荐功能会让用户体验大幅提升，期待你的精彩实现！🚀
