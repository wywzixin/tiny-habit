# AI 推荐慢的问题整改方案（接口设计 + 前端示例 + 提示词）

> 目的：把「输入后同时请求微行为 + 锚点」改成 **一次请求返回全部**，并加上缓存/防抖/取消，显著降低 6–8s 延迟与乱序返回问题。

---

## 一、后端改造提示词（给后端 AI）

**任务目标：**
- 合并当前 `推荐微行为` + `推荐锚点` 两个接口为一个接口  
- 支持缓存、超时、降级  
- 统一结构化 JSON 返回

**请按以下要求修改后端：**

### 1) 新增合并接口
```
POST /api/ai/recommend
```

**请求体：**
```json
{
  "goal": "string",                 // 用户输入的目标/习惯描述
  "language": "zh" | "en",           // 可选
  "userContext": "string",           // 可选，补充信息
  "maxItems": 6                      // 可选，限制返回条数
}
```

**响应体（必须严格 JSON，无多余文本）：**
```json
{
  "micro_behaviors": [
    {
      "name": "晨起喝水",
      "behavior": "起床后先喝一口水",
      "difficulty": "easy",
      "estimatedTime": "30s",
      "description": "起床后喝一口水帮助唤醒身体",
      "icon": "💧",
      "anchor_suggestions": ["起床后", "刷牙后", "出门前"]
    }
  ],
  "anchors": [
    { "anchor": "起床后", "timeOfDay": "morning", "description": "", "icon": "☀️" }
  ],
  "meta": {
    "cached": true,
    "latency_ms": 1234,
    "model": "glm-4-xxxxx"
  }
}
```

**失败时返回：**
```json
{ "micro_behaviors": [], "anchors": [], "meta": { "cached": false } }
```

### 2) Prompt 要求（强制 JSON）
**提示词要求：**
- 只输出 JSON，不要任何解释  
- `micro_behaviors` 至少 3 条  
- 每条包含 `anchor_suggestions` 数组  
- 字段名固定，不要缺失

**示例 Prompt：**
```
你是一个习惯设计助理。请严格输出 JSON（不要任何其他文字）。
返回字段：micro_behaviors[], anchors[], meta{}。
micro_behaviors 每项包含：name, behavior, difficulty, estimatedTime, description, icon, anchor_suggestions[]。
anchors 每项包含：anchor, timeOfDay, description, icon。
语言：${language}。
用户目标：${goal}。
```

### 3) 缓存策略
- Key = `ai:recommend:${language}:${hash(goal)}`
- TTL = 24h  
- Redis 优先，不可用则内存缓存  
- 命中缓存直接返回，`meta.cached = true`

### 4) 性能建议
- `max_tokens` 限制输出长度  
- `temperature` 稳定在 0.5–0.7  
- 若支持 streaming，开启 stream（前端可渐进渲染）

---

## 二、前端改造提示词（给前端 AI）

**目标：**
1 次请求获取完整推荐；点击微行为后不再请求后端锚点  
加入缓存 + 防抖 + 取消前一个请求

### 1) 新增接口类型
在 `services/api/ai.ts` 增加类型：
```ts
export type AiRecommendRequest = {
  goal: string;
  language: 'zh' | 'en';
  userContext?: string;
  maxItems?: number;
};

export type AiMicroBehavior = {
  name: string;
  behavior: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  description?: string;
  icon?: string;
  anchor_suggestions?: string[];
};

export type AiAnchor = {
  anchor: string;
  timeOfDay?: string;
  description?: string;
  icon?: string;
};

export type AiRecommendResponse = {
  micro_behaviors: AiMicroBehavior[];
  anchors?: AiAnchor[];
  meta?: { cached?: boolean; latency_ms?: number; model?: string };
};
```

### 2) 新增 hook
在 `services/api/hooks` 新增 `useRecommendAiCombined`：
```ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { AiRecommendRequest, AiRecommendResponse } from '../ai';

export function useRecommendAiCombined() {
  return useMutation({
    mutationFn: async (payload: AiRecommendRequest & { signal?: AbortSignal }) => {
      const { signal, ...body } = payload;
      const res = await apiClient.post('/api/ai/recommend', body, { signal });
      return res.data as AiRecommendResponse;
    },
  });
}
```

### 3) 新建配方页逻辑改造（`app/create.tsx`）
**核心：**
- 删除 `useRecommendMicroBehaviors` / `useRecommendAnchors` 的调用  
- 只保留 `useRecommendAiCombined`
- 点击微行为后直接使用 `anchor_suggestions`

**示例代码：**
```ts
const recommendMutation = useRecommendAiCombined();
const cacheRef = useRef(new Map<string, { data: AiRecommendResponse; ts: number }>());
const abortRef = useRef<AbortController | null>(null);

const getCacheKey = (goal: string) => `${language}:${goal.trim()}`;
const CACHE_TTL = 24 * 60 * 60 * 1000;

const fetchAiRecommend = async (goal: string) => {
  const key = getCacheKey(goal);
  const cached = cacheRef.current.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    setAiMicroBehaviors(cached.data.micro_behaviors || []);
    setAiAnchors(cached.data.anchors || []);
    return;
  }

  abortRef.current?.abort();
  const controller = new AbortController();
  abortRef.current = controller;

  const res = await recommendMutation.mutateAsync({
    goal,
    language,
    maxItems: 6,
    signal: controller.signal,
  });

  cacheRef.current.set(key, { data: res, ts: Date.now() });
  setAiMicroBehaviors(res.micro_behaviors || []);
  setAiAnchors(res.anchors || []);
};
```

**onBlur 触发 + 防抖：**
```ts
const debouncedFetch = useMemo(() => debounce(fetchAiRecommend, 700), [language]);

const handleGoalBlur = () => {
  const g = goal.trim();
  if (!g) return;
  debouncedFetch(g);
};
```

**点击微行为时：**
```ts
const selectAiMicroBehavior = (item: AiMicroBehavior) => {
  setBehavior(item.behavior || item.name);
  const anchors = (item.anchor_suggestions || []).map(a => ({ anchor: a }));
  setAiAnchors(anchors.length ? anchors : []);
  setAnchor('');
};
```

### 4) UI/体验优化
- AI 未返回时显示 skeleton 或“正在生成”  
- 超过 3 秒提示“可继续填写，稍后自动更新”  
- 若接口失败 → 显示本地推荐模板  

---

## 三、具体修改清单（给 AI 执行）

**后端：**
1. 新增 `/api/ai/recommend`  
2. 合并 prompt + JSON 输出  
3. 缓存 + 超时 + fallback  

**前端：**
1. 新增 `useRecommendAiCombined`  
2. `create.tsx` 替换原来的 2 个请求  
3. 增加 cache / debounce / abort  
4. 点击微行为不再请求锚点  

---

## 四、预期效果

- 请求次数从 2～3 次变为 1 次  
- 平均等待显著下降（通常 < 3s）  
- 避免“锚点先回来，微行为后回来”的错乱  
- 点击微行为不再二次等待  

---

如需进一步细化：可以追加 **服务端缓存 + 流式返回 + 预生成热门模板**，效果会更明显。
