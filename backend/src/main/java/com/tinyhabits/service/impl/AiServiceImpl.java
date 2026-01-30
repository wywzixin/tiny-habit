package com.tinyhabits.service.impl;

import ai.z.openapi.ZhipuAiClient;
import ai.z.openapi.service.model.ChatCompletionCreateParams;
import ai.z.openapi.service.model.ChatCompletionResponse;
import ai.z.openapi.service.model.ChatMessage;
import ai.z.openapi.service.model.ChatMessageRole;
import com.tinyhabits.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AiServiceImpl implements AiService {

    private final ZhipuAiClient zhipuAiClient;
    
    @Value("${zhipuai.model}")
    private String model;

    public AiServiceImpl(ZhipuAiClient zhipuAiClient) {
        this.zhipuAiClient = zhipuAiClient;
    }

    @Override
    public String testConnection() {
        return chat("你好，请简单介绍一下你自己");
    }

    @Override
    public String chat(String message) {
        try {
            // 创建聊天完成请求
            ChatCompletionCreateParams request = ChatCompletionCreateParams.builder()
                    .model(model)
                    .messages(Arrays.asList(
                            ChatMessage.builder()
                                    .role(ChatMessageRole.USER.value())
                                    .content(message)
                                    .build()
                    ))
                    .maxTokens(2048)
                    .temperature(0.7f)
                    .build();

            // 发送请求
            ChatCompletionResponse response = zhipuAiClient.chat().createChatCompletion(request);

            // 获取回复
            if (response.isSuccess()) {
                ChatMessage replyMessage = response.getData().getChoices().get(0).getMessage();
                // 只返回 content 内容，不返回整个对象
                Object content = replyMessage.getContent();
                return content != null ? content.toString() : "";
            } else {
                return "错误: " + response.getMsg();
            }
        } catch (Exception e) {
            return "调用失败: " + e.getMessage();
        }
    }

    @Override
    public String recommendMicroBehaviors(String habitName, String habitCategory, String userContext) {
        String prompt = buildMicroBehaviorPrompt(habitName, habitCategory, userContext);
        String response = chat(prompt);
        // 清理 AI 返回的 markdown 代码块标记
        return cleanJsonResponse(response);
    }

    @Override
    public String recommendAnchors(String habitName, String timeOfDay, String userContext) {
        String prompt = buildAnchorPrompt(habitName, timeOfDay, userContext);
        String response = chat(prompt);
        // 清理 AI 返回的 markdown 代码块标记
        return cleanJsonResponse(response);
    }

    /**
     * 清理 AI 返回的 JSON，去除 markdown 代码块标记
     */
    private String cleanJsonResponse(String response) {
        if (response == null) {
            return "";
        }
        // 去除 ```json 和 ``` 标记
        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    /**
     * 构建推荐微行为的提示词
     */
    private String buildMicroBehaviorPrompt(String habitName, String habitCategory, String userContext) {
        StringBuilder prompt = new StringBuilder();
        
        // 角色定位
        prompt.append("# Role: 顶级行为设计专家 (Master Behavior Design Specialist)\n\n");
        prompt.append("# Profile:\n");
        prompt.append("你是一位世界级的人类行为学专家，深研斯坦福大学 B.J. Fogg 博士的《福格行为模型》（Tiny Habits）理论。");
        prompt.append("你不仅仅是一个简单的习惯助手，你精通 B=MAP 模型（行为=动机×能力×提示）的底层逻辑。\n\n");
        
        // 用户信息
        prompt.append("# 用户信息:\n");
        prompt.append("- 目标习惯：").append(habitName).append("\n");
        prompt.append("- 习惯分类：").append(habitCategory).append("\n");
        if (userContext != null && !userContext.trim().isEmpty()) {
            prompt.append("- 用户背景：").append(userContext).append("\n");
        }
        prompt.append("\n");
        
        // 任务说明
        prompt.append("# 任务:\n");
        prompt.append("基于福格行为模型，为用户设计 3-5 个「微行为」（Tiny Habits），帮助用户养成「").append(habitName).append("」这个习惯。\n\n");
        
        // 设计原则
        prompt.append("# 设计原则（基于 B=MAP 模型）:\n");
        prompt.append("1. **降低能力门槛（Ability）**：\n");
        prompt.append("   - 提供不同难度层级的微行为，从「超级简单」到「适度挑战」\n");
        prompt.append("   - easy：30秒-2分钟（如穿跑鞋、走出门）\n");
        prompt.append("   - medium：5-10分钟（如跑1公里、读5页书）\n");
        prompt.append("   - hard：10-20分钟（如跑3公里、读15页书）\n");
        prompt.append("   - 核心：相比最终目标，这些都是「更小、更易完成的版本」\n");
        prompt.append("2. **无需高动机（Motivation）**：即使动机较低时也能完成（至少 easy 级别）\n");
        prompt.append("3. **具体可执行（Specific）**：避免模糊描述，给出精确的行为指令\n");
        prompt.append("4. **可测量（Measurable）**：用户能清楚知道自己是否完成了\n");
        prompt.append("5. **渐进式（Progressive）**：用户可以从 easy 开始，逐步提升到 medium/hard\n\n");
        
        // 输出格式
        prompt.append("# 输出格式:\n");
        prompt.append("请以 JSON 数组格式返回，每个微行为包含以下字段：\n");
        prompt.append("- name: 微行为名称（简洁有力）\n");
        prompt.append("- behavior: 具体行为（10字以内，动词开头）\n");
        prompt.append("- description: 设计理由（基于 B=MAP 模型解释为什么这个设计有效，50字以内）\n");
        prompt.append("- difficulty: 难度等级（easy/medium/hard）\n");
        prompt.append("- estimatedTime: 预计完成时间（如：30秒、2分钟、5分钟、10分钟）\n");
        prompt.append("- icon: emoji 图标（选择最贴切的）\n\n");
        
        // 时间估算说明
        prompt.append("# 时间估算标准:\n");
        prompt.append("- easy 级别：通常 30秒-2分钟\n");
        prompt.append("- medium 级别：通常 5-10分钟\n");
        prompt.append("- hard 级别：通常 10-20分钟\n");
        prompt.append("- 请根据具体行为给出合理的时间估算，帮助用户了解时间投入\n\n");
        
        // 示例
        prompt.append("# 示例:\n");
        prompt.append("[{\"name\":\"穿上跑鞋\",\"behavior\":\"穿上跑鞋\",\"description\":\"能力极低（10秒），零动机门槛，适合完全不想动的时候\",\"difficulty\":\"easy\",\"estimatedTime\":\"30秒\",\"icon\":\"👟\"},{\"name\":\"跑步1公里\",\"behavior\":\"跑1公里\",\"description\":\"适度挑战（8-10分钟），比5公里更易完成，建立跑步习惯的中间步骤\",\"difficulty\":\"medium\",\"estimatedTime\":\"8分钟\",\"icon\":\"🏃\"},{\"name\":\"跑步3公里\",\"behavior\":\"跑3公里\",\"description\":\"较大挑战，接近目标，适合已有基础的用户\",\"difficulty\":\"hard\",\"estimatedTime\":\"20分钟\",\"icon\":\"🏃‍♂️\"}]\n\n");
        
        // 重要提示
        prompt.append("# 重要:\n");
        prompt.append("- 直接返回 JSON 数组，不要有任何其他文字，不要用 markdown 代码块包裹\n");
        prompt.append("- 推荐 6 个不同难度的微行为，让用户有充分的选择空间\n");
        prompt.append("- 必须按难度从低到高排序：easy → medium → hard\n");
        prompt.append("- 至少包含 2 个 easy 级别（超级简单的启动行为）\n");
        prompt.append("- 至少包含 2 个 medium 级别（适度挑战的行为）\n");
        prompt.append("- 至少包含 2 个 hard 级别（接近目标的行为）\n");
        prompt.append("- description 必须体现 B=MAP 模型的思考\n");
        prompt.append("- 记住：微习惯是相对的，关键是比最终目标更容易完成\n");
        
        return prompt.toString();
    }

    /**
     * 构建推荐锚点的提示词
     */
    private String buildAnchorPrompt(String habitName, String timeOfDay, String userContext) {
        StringBuilder prompt = new StringBuilder();
        
        // 角色定位
        prompt.append("# Role: 顶级行为设计专家 (Master Behavior Design Specialist)\n\n");
        prompt.append("# Profile:\n");
        prompt.append("你是一位世界级的人类行为学专家，深研斯坦福大学 B.J. Fogg 博士的《福格行为模型》（Tiny Habits）理论。");
        prompt.append("你精通「锚点技巧」（Anchor）在习惯养成中的关键作用，理解如何利用现有习惯触发新习惯。\n\n");
        
        // 用户信息
        prompt.append("# 用户信息:\n");
        prompt.append("- 目标习惯：").append(habitName).append("\n");
        if (timeOfDay != null && !timeOfDay.trim().isEmpty()) {
            prompt.append("- 偏好时间段：").append(timeOfDay).append("\n");
        }
        if (userContext != null && !userContext.trim().isEmpty()) {
            prompt.append("- 用户背景：").append(userContext).append("\n");
        }
        prompt.append("\n");
        
        // 任务说明
        prompt.append("# 任务:\n");
        prompt.append("基于福格行为模型的「锚点理论」，为用户推荐 6 个最佳锚点（Anchor），");
        prompt.append("帮助用户将「").append(habitName).append("」这个新习惯嵌入到现有的生活节奏中。\n\n");
        
        // ⚠️ 关键规则
        prompt.append("# ⚠️ 关键规则（必须遵守）:\n");
        prompt.append("1. **场景匹配**：锚点必须与习惯的【执行场景】相匹配\n");
        prompt.append("2. **已有行为**：锚点必须是用户【已有的日常行为】，而非新行为\n");
        prompt.append("3. **时空适配**：锚点发生的【时间和地点】必须适合执行该习惯\n");
        prompt.append("4. **状态适配**：锚点后的身体和心理状态必须适合执行该习惯\n\n");
        
        // 错误示例
        prompt.append("# 🚫 错误示例（跑步习惯）:\n");
        prompt.append("- ❌ 睡前准备后 → 睡前不适合跑步（时间不匹配）\n");
        prompt.append("- ❌ 看电视时 → 看电视时无法跑步（场景冲突）\n");
        prompt.append("- ❌ 听音乐时 → 太宽泛，不是具体锚点（不够具体）\n");
        prompt.append("- ❌ 开始跑步前 → 这是新行为，不是已有锚点（循环定义）\n\n");
        
        // 正确示例
        prompt.append("# ✅ 正确示例（跑步习惯）:\n");
        prompt.append("- ✓ 起床穿好衣服后 → 早晨适合晨跑，状态清醒\n");
        prompt.append("- ✓ 下班回家换好运动服后 → 傍晚适合跑步，有时间\n");
        prompt.append("- ✓ 午休结束后 → 下午可以运动，精神恢复\n\n");
        
        // 锚点推荐逻辑
        prompt.append("# 锚点推荐逻辑:\n");
        prompt.append("1. **分析习惯的最佳执行时间**（早上/下午/晚上）\n");
        prompt.append("2. **分析习惯的执行地点要求**（室内/室外/健身房/办公室）\n");
        prompt.append("3. **分析习惯的前置准备**（换衣服/准备器材/清空时间）\n");
        prompt.append("4. **匹配用户在该时间段的已有行为**作为锚点\n\n");
        
        // 习惯分类与锚点建议
        prompt.append("# 习惯分类与锚点建议:\n");
        prompt.append("- **运动类**（跑步/健身/瑜伽）→ 换好运动服后、起床后、下班回家后、午休结束后\n");
        prompt.append("- **阅读类**（看书/学习）→ 睡前躺下后、午休时、通勤坐下后、晚饭后\n");
        prompt.append("- **冥想类**（冥想/放松）→ 起床后、午饭后、睡前、洗完澡后\n");
        prompt.append("- **学习类**（学习/工作）→ 到办公室后、打开电脑后、午休后、晚饭后\n");
        prompt.append("- **饮水类**（喝水/补水）→ 起床后、到公司后、每次上完厕所后、吃完饭后\n");
        prompt.append("- **整理类**（收拾/清洁）→ 起床后、下班回家后、睡前、周末早上\n\n");
        
        // 锚点选择标准
        prompt.append("# 锚点选择标准（基于福格理论）:\n");
        prompt.append("1. **高频率（Frequency）**：用户每天都会做的固定行为\n");
        prompt.append("2. **可预测（Predictability）**：发生时间和地点相对固定\n");
        prompt.append("3. **易识别（Recognizability）**：用户能立即意识到这个时刻\n");
        prompt.append("4. **自然关联（Natural Connection）**：与目标习惯有逻辑或情境上的联系\n");
        prompt.append("5. **情绪中性（Emotional Neutrality）**：不是在压力或负面情绪下发生的行为\n\n");
        
        // 输出格式
        prompt.append("# 输出格式:\n");
        prompt.append("请以 JSON 数组格式返回，每个锚点包含以下字段：\n");
        prompt.append("- anchor: 锚点行为（8字以内，清晰具体）\n");
        prompt.append("- description: 推荐理由（说明为什么这个锚点与习惯匹配，50字以内）\n");
        prompt.append("- timeOfDay: 时间段（早上/中午/下午/晚上）\n");
        prompt.append("- icon: emoji 图标\n\n");
        
        // 示例
        prompt.append("# 示例（跑步习惯）:\n");
        prompt.append("[{\"anchor\":\"起床穿好衣服后\",\"description\":\"早晨精神状态好，适合晨跑，时间充裕\",\"timeOfDay\":\"早上\",\"icon\":\"👕\"},{\"anchor\":\"下班换好运动服后\",\"description\":\"傍晚时间灵活，换好衣服后可直接出门跑步\",\"timeOfDay\":\"晚上\",\"icon\":\"👟\"}]\n\n");
        
        // 重要提示
        prompt.append("# 重要:\n");
        prompt.append("- 直接返回 JSON 数组，不要有任何其他文字，不要用 markdown 代码块包裹\n");
        prompt.append("- 推荐 6 个锚点，确保时间、地点、状态都与习惯执行相匹配\n");
        prompt.append("- 覆盖一天中的不同时间段（早上/中午/下午/晚上）\n");
        prompt.append("- 优先推荐用户每天必做的「仪式性行为」\n");
        prompt.append("- 每个锚点都要体现福格理论的核心原则\n");
        prompt.append("- 避免推荐需要额外记忆或提醒的行为\n");
        prompt.append("- 避免推荐与习惯执行场景冲突的锚点（如：睡前跑步、看电视时运动）\n");
        
        return prompt.toString();
    }
}
