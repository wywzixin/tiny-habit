package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.dto.AddFromTemplateRequest;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.service.MicroBehaviorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/micro-behavior")
public class MicroBehaviorController {

    private final MicroBehaviorService microBehaviorService;

    public MicroBehaviorController(MicroBehaviorService microBehaviorService) {
        this.microBehaviorService = microBehaviorService;
    }

    @PostMapping
    public Result<MicroBehavior> create(@RequestBody MicroBehavior mb) {
        return Result.success(microBehaviorService.create(mb));
    }

    @GetMapping("/{id}")
    public Result<MicroBehavior> getById(@PathVariable Long id) {
        return Result.success(microBehaviorService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public Result<List<MicroBehavior>> getByUserId(@PathVariable Long userId) {
        return Result.success(microBehaviorService.getByUserId(userId));
    }

    @GetMapping("/habit/{habitId}")
    public Result<List<MicroBehavior>> getByHabitId(@PathVariable Long habitId) {
        return Result.success(microBehaviorService.getByHabitId(habitId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        microBehaviorService.delete(id);
        return Result.success();
    }

    /**
     * 从配方模板添加微行为
     * 用于发现页面点击"+"按钮
     */
    @PostMapping("/add-from-template")
    public Result<MicroBehavior> addFromTemplate(
            @RequestAttribute("userId") Long userId,
            @RequestBody AddFromTemplateRequest request) {
        try {
            if (request.getTemplateId() == null) {
                return Result.error(400, "templateId不能为空");
            }
            
            MicroBehavior microBehavior = microBehaviorService.addFromTemplate(
                userId,
                request.getTemplateId(),
                request.getFrequency(),
                request.getReminderEnabled(),
                request.getReminderTime()
            );
            
            return Result.success(microBehavior);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
