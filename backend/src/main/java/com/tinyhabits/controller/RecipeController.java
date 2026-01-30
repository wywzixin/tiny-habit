package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.dto.CreateRecipeRequest;
import com.tinyhabits.dto.CreateRecipeResponse;
import com.tinyhabits.dto.UpdateRecipeRequest;
import com.tinyhabits.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipe")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    /**
     * 创建配方（组合接口）
     * 一次性创建习惯+微行为，或为已有习惯添加微行为
     */
    @PostMapping("/create")
    public Result<CreateRecipeResponse> createRecipe(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateRecipeRequest request) {
        try {
            CreateRecipeResponse response = recipeService.createRecipe(userId, request);
            return Result.success(response);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新配方（编辑接口）
     * 更新微行为信息，如果微行为绑定了习惯，也可以更新习惯信息
     */
    @PutMapping("/update")
    public Result<CreateRecipeResponse> updateRecipe(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody UpdateRecipeRequest request) {
        try {
            CreateRecipeResponse response = recipeService.updateRecipe(userId, request);
            return Result.success(response);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
