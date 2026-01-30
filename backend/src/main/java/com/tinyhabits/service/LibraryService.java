package com.tinyhabits.service;

import com.tinyhabits.dto.RecipeTemplateResponse;
import com.tinyhabits.entity.BehaviorRecipeTemplate;
import com.tinyhabits.entity.HabitLibrary;
import java.util.List;

public interface LibraryService {
    List<HabitLibrary> getHabitLibrary(String category);
    List<BehaviorRecipeTemplate> getRecipeTemplates(String category);
    List<RecipeTemplateResponse> getRecipeTemplatesWithAddedStatus(String category, Long userId);
    List<RecipeTemplateResponse> getRecipeTemplatesForUser(String category, Long userId);
}
