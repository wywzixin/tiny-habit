package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.tinyhabits.dto.RecipeTemplateResponse;
import com.tinyhabits.entity.BehaviorRecipeTemplate;
import com.tinyhabits.entity.HabitLibrary;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.mapper.BehaviorRecipeTemplateMapper;
import com.tinyhabits.mapper.HabitLibraryMapper;
import com.tinyhabits.mapper.MicroBehaviorMapper;
import com.tinyhabits.service.LibraryService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LibraryServiceImpl implements LibraryService {

    private final HabitLibraryMapper habitLibraryMapper;
    private final BehaviorRecipeTemplateMapper recipeTemplateMapper;
    private final MicroBehaviorMapper microBehaviorMapper;

    public LibraryServiceImpl(HabitLibraryMapper habitLibraryMapper, 
                             BehaviorRecipeTemplateMapper recipeTemplateMapper,
                             MicroBehaviorMapper microBehaviorMapper) {
        this.habitLibraryMapper = habitLibraryMapper;
        this.recipeTemplateMapper = recipeTemplateMapper;
        this.microBehaviorMapper = microBehaviorMapper;
    }

    @Override
    public List<HabitLibrary> getHabitLibrary(String category) {
        QueryWrapper<HabitLibrary> wrapper = new QueryWrapper<>();
        if (category != null && !category.isEmpty()) {
            wrapper.eq("category", category);
        }
        wrapper.orderByDesc("popularity");
        return habitLibraryMapper.selectList(wrapper);
    }

    @Override
    public List<BehaviorRecipeTemplate> getRecipeTemplates(String category) {
        QueryWrapper<BehaviorRecipeTemplate> wrapper = new QueryWrapper<>();
        if (category != null && !category.isEmpty()) {
            wrapper.eq("category", category);
        }
        wrapper.orderByDesc("popularity");
        return recipeTemplateMapper.selectList(wrapper);
    }

    @Override
    public List<RecipeTemplateResponse> getRecipeTemplatesWithAddedStatus(String category, Long userId) {
        // 1. 查询所有配方模板
        List<BehaviorRecipeTemplate> templates = getRecipeTemplates(category);
        
        // 2. 查询当前用户已添加的模板ID集合
        QueryWrapper<MicroBehavior> mbWrapper = new QueryWrapper<>();
        mbWrapper.eq("user_id", userId)
                .eq("is_active", true)
                .isNotNull("source_template_id");
        
        List<MicroBehavior> userMicroBehaviors = microBehaviorMapper.selectList(mbWrapper);
        Set<Long> addedTemplateIds = userMicroBehaviors.stream()
                .map(MicroBehavior::getSourceTemplateId)
                .collect(Collectors.toSet());
        
        // 3. 组装响应数据，标记是否已添加
        return templates.stream()
                .map(template -> {
                    boolean isAdded = addedTemplateIds.contains(template.getId());
                    return new RecipeTemplateResponse(template, isAdded);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<RecipeTemplateResponse> getRecipeTemplatesForUser(String category, Long userId) {
        // 使用相同的逻辑，统一接口
        return getRecipeTemplatesWithAddedStatus(category, userId);
    }
}
