package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.entity.CheckIn;
import com.tinyhabits.service.CheckInService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkin")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    /**
     * 打卡
     * habitId 可以为 null（从配方库添加的微行为没有关联父习惯）
     */
    @PostMapping
    public Result<CheckIn> checkIn(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Long> params) {
        try {
            Long microBehaviorId = params.get("microBehaviorId");
            Long habitId = params.get("habitId");  // 可以为 null
            
            if (microBehaviorId == null) {
                return Result.error(400, "microBehaviorId不能为空");
            }
            
            CheckIn checkIn = checkInService.checkIn(microBehaviorId, habitId, userId);
            return Result.success(checkIn);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户打卡记录
     */
    @GetMapping("/user/{userId}")
    public Result<List<CheckIn>> getByUserId(@PathVariable Long userId) {
        return Result.success(checkInService.getByUserId(userId));
    }

    /**
     * 获取用户今日打卡记录
     */
    @GetMapping("/today/{userId}")
    public Result<List<CheckIn>> getTodayByUserId(@PathVariable Long userId) {
        return Result.success(checkInService.getTodayByUserId(userId));
    }

    /**
     * 取消打卡
     * 仅允许取消今日的打卡记录
     */
    @PostMapping("/cancel")
    public Result<Map<String, Object>> cancelCheckIn(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Long> params) {
        try {
            Long microBehaviorId = params.get("microBehaviorId");
            Long habitId = params.get("habitId");  // 可以为 null
            
            if (microBehaviorId == null) {
                return Result.error(400, "microBehaviorId不能为空");
            }
            
            Map<String, Object> result = checkInService.cancelCheckIn(microBehaviorId, habitId, userId);
            return Result.success(result);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
