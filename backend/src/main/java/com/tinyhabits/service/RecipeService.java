package com.tinyhabits.service;

import com.tinyhabits.dto.CreateRecipeRequest;
import com.tinyhabits.dto.CreateRecipeResponse;
import com.tinyhabits.dto.UpdateRecipeRequest;

public interface RecipeService {
    CreateRecipeResponse createRecipe(Long userId, CreateRecipeRequest request);
    CreateRecipeResponse updateRecipe(Long userId, UpdateRecipeRequest request);
}
