package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.dto.HabitLibraryResponse;
import com.tinyhabits.dto.MicroBehaviorWithHabitResponse;
import com.tinyhabits.dto.MyHabitLibraryResponse;
import com.tinyhabits.entity.Habit;
import com.tinyhabits.service.HabitService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habit")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    /**
     * 获取我的习惯库
     * 包含用户自己创建的习惯和从系统习惯库添加的习惯
     */
    @GetMapping("/my-library")
    public Result<List<MyHabitLibraryResponse>> getMyLibrary(@RequestAttribute("userId") Long userId) {
        try {
            List<MyHabitLibraryResponse> library = habitService.getMyLibrary(userId);
            return Result.success(library);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户的微行为列表（包含习惯信息）
     * 用于首页展示
     */
    @GetMapping("/user/{userId}/micro-behaviors")
    public Result<List<MicroBehaviorWithHabitResponse>> getUserMicroBehaviors(@PathVariable Long userId) {
        try {
            List<MicroBehaviorWithHabitResponse> microBehaviors = habitService.getUserMicroBehaviors(userId);
            return Result.success(microBehaviors);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取习惯库（用户的 + 系统的）
     * 用于创建配方页面的习惯选择
     */
    @GetMapping("/library")
    public Result<List<HabitLibraryResponse>> getLibrary(
            @RequestAttribute("userId") Long userId,
            @RequestParam(required = false) String category) {
        try {
            List<HabitLibraryResponse> library = habitService.getLibrary(userId, category);
            return Result.success(library);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除习惯
     * 注意：
     * - 只能删除用户自己创建的习惯
     * - 系统推荐的习惯不能删除
     * - 会同时删除该习惯下的所有微行为
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        try {
            // 验证权限
            MyHabitLibraryResponse habit = habitService.getMyLibrary(userId).stream()
                    .filter(h -> h.getId().equals(id))
                    .findFirst()
                    .orElse(null);
            
            if (habit == null) {
                return Result.error(404, "习惯不存在或无权操作");
            }
            
            // 检查是否为系统习惯
            if (habit.getIsFromSystem()) {
                return Result.error(403, "系统推荐的习惯不能删除");
            }
            
            habitService.delete(id);
            return Result.success();
        } catch (RuntimeException e) {
            // 如果是系统习惯删除错误，返回403
            if (e.getMessage().contains("系统推荐")) {
                return Result.error(403, e.getMessage());
            }
            return Result.error(e.getMessage());
        }
    }
}
