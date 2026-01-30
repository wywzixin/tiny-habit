package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.dto.TodayCheckInResponse;
import com.tinyhabits.service.StatsService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/user/{userId}")
    public Result<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        return Result.success(statsService.getUserStats(userId));
    }

    /**
     * 获取今日打卡数据（发光时刻）
     */
    @GetMapping("/today-checkins/{userId}")
    public Result<List<TodayCheckInResponse>> getTodayCheckIns(@PathVariable Long userId) {
        return Result.success(statsService.getTodayCheckIns(userId));
    }
}
