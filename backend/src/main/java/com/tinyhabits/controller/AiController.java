package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * 测试 AI 连接
     */
    @GetMapping("/test")
    public Result<String> test() {
        try {
            String response = aiService.testConnection();
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("测试失败: " + e.getMessage());
        }
    }

    /**
     * 发送消息给 AI
     */
    @PostMapping("/chat")
    public Result<String> chat(@RequestBody Map<String, String> params) {
        try {
            String message = params.get("message");
            if (message == null || message.trim().isEmpty()) {
                return Result.error(400, "消息不能为空");
            }
            
            String response = aiService.chat(message);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("聊天失败: " + e.getMessage());
        }
    }

    /**
     * 推荐微行为
     */
    @PostMapping("/recommend/micro-behaviors")
    public Result<String> recommendMicroBehaviors(@RequestBody Map<String, String> params) {
        try {
            String habitName = params.get("habitName");
            String habitCategory = params.get("habitCategory");
            String userContext = params.get("userContext");
            
            if (habitName == null || habitName.trim().isEmpty()) {
                return Result.error(400, "习惯名称不能为空");
            }
            
            String response = aiService.recommendMicroBehaviors(habitName, habitCategory, userContext);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("推荐失败: " + e.getMessage());
        }
    }

    /**
     * 推荐锚点
     */
    @PostMapping("/recommend/anchors")
    public Result<String> recommendAnchors(@RequestBody Map<String, String> params) {
        try {
            String habitName = params.get("habitName");
            String timeOfDay = params.get("timeOfDay");
            String userContext = params.get("userContext");
            
            if (habitName == null || habitName.trim().isEmpty()) {
                return Result.error(400, "习惯名称不能为空");
            }
            
            String response = aiService.recommendAnchors(habitName, timeOfDay, userContext);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("推荐失败: " + e.getMessage());
        }
    }
}
