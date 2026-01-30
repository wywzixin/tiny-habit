package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.dto.RecipeTemplateResponse;
import com.tinyhabits.entity.BehaviorRecipeTemplate;
import com.tinyhabits.entity.HabitLibrary;
import com.tinyhabits.service.LibraryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping("/habits")
    public Result<List<HabitLibrary>> getHabitLibrary(
            @RequestParam(required = false) String category) {
        return Result.success(libraryService.getHabitLibrary(category));
    }

    /**
     * 获取配方模板列表（已登录用户）
     * 包含 isAdded 字段，标识用户是否已添加该配方
     */
    @GetMapping("/recipes")
    public Result<List<RecipeTemplateResponse>> getRecipeTemplates(
            @RequestParam(required = false) String category,
            @RequestAttribute("userId") Long userId) {
        return Result.success(libraryService.getRecipeTemplatesForUser(category, userId));
    }

    /**
     * 获取配方模板列表（已登录用户使用）
     * 包含 isAdded 字段，标识用户是否已添加该配方
     */
    @GetMapping("/recipes/with-status")
    public Result<List<RecipeTemplateResponse>> getRecipeTemplatesWithStatus(
            @RequestParam(required = false) String category,
            @RequestAttribute("userId") Long userId) {
        return Result.success(libraryService.getRecipeTemplatesWithAddedStatus(category, userId));
    }
}
