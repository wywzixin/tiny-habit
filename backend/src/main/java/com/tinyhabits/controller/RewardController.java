package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.entity.Reward;
import com.tinyhabits.service.RewardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reward")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @PostMapping
    public Result<Reward> create(@RequestBody Reward reward) {
        return Result.success(rewardService.create(reward));
    }

    @GetMapping("/user/{userId}")
    public Result<List<Reward>> getByUserId(@PathVariable Long userId) {
        return Result.success(rewardService.getByUserId(userId));
    }

    @PostMapping("/{id}/redeem")
    public Result<Reward> redeem(@PathVariable Long id, @RequestBody Map<String, Long> params) {
        return Result.success(rewardService.redeem(id, params.get("userId")));
    }
}
