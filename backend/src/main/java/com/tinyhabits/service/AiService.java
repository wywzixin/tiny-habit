package com.tinyhabits.service;

import java.util.List;

public interface AiService {
    /**
     * 测试 AI 连接
     */
    String testConnection();
    
    /**
     * 发送消息给 AI
     */
    String chat(String message);
    
    /**
     * 推荐微行为
     * @param habitName 习惯名称
     * @param habitCategory 习惯分类
     * @param userContext 用户上下文（可选）
     * @return 推荐的微行为列表（JSON格式）
     */
    String recommendMicroBehaviors(String habitName, String habitCategory, String userContext);
    
    /**
     * 推荐锚点
     * @param habitName 习惯名称
     * @param timeOfDay 一天中的时间段（早上/中午/晚上）
     * @param userContext 用户上下文（可选）
     * @return 推荐的锚点列表（JSON格式）
     */
    String recommendAnchors(String habitName, String timeOfDay, String userContext);
}
