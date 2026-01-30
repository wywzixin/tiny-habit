package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tinyhabits.dto.CreateRecipeRequest;
import com.tinyhabits.dto.CreateRecipeResponse;
import com.tinyhabits.dto.MicroBehaviorRequest;
import com.tinyhabits.dto.UpdateRecipeRequest;
import com.tinyhabits.entity.Habit;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.mapper.HabitMapper;
import com.tinyhabits.mapper.MicroBehaviorMapper;
import com.tinyhabits.service.RecipeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final HabitMapper habitMapper;
    private final MicroBehaviorMapper microBehaviorMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RecipeServiceImpl(HabitMapper habitMapper, MicroBehaviorMapper microBehaviorMapper) {
        this.habitMapper = habitMapper;
        this.microBehaviorMapper = microBehaviorMapper;
    }

    @Override
    @Transactional
    public CreateRecipeResponse createRecipe(Long userId, CreateRecipeRequest request) {
        Habit habit;
        boolean isNewHabit;

        // 判断是创建新习惯还是使用已有习惯
        if (request.getHabitId() == null) {
            // 创建新习惯
            if (request.getHabitName() == null || request.getHabitName().trim().isEmpty()) {
                throw new RuntimeException("习惯名称不能为空");
            }
            if (request.getHabitCategory() == null || request.getHabitCategory().trim().isEmpty()) {
                throw new RuntimeException("习惯分类不能为空");
            }

            habit = new Habit();
            habit.setUserId(userId);
            habit.setName(request.getHabitName());
            habit.setIcon(request.getHabitIcon());
            habit.setCategory(request.getHabitCategory());
            habit.setDescription(request.getHabitDescription());
            habit.setMicroBehaviorCount(0);
            habit.setIsActive(true);
            habit.setIsPublic(false);

            habitMapper.insert(habit);
            isNewHabit = true;
        } else {
            // 使用已有习惯
            habit = habitMapper.selectById(request.getHabitId());
            if (habit == null) {
                throw new RuntimeException("习惯不存在");
            }
            if (!habit.getUserId().equals(userId)) {
                throw new RuntimeException("无权操作该习惯");
            }
            isNewHabit = false;
        }

        // 创建微行为
        MicroBehavior microBehavior = createMicroBehavior(userId, habit.getId(), request.getMicroBehavior());

        // 更新习惯的微行为ID列表和计数
        updateHabitMicroBehaviorIds(habit.getId(), microBehavior.getId());

        // 构建响应
        CreateRecipeResponse.HabitInfo habitInfo = new CreateRecipeResponse.HabitInfo(habit, isNewHabit);
        return new CreateRecipeResponse(habitInfo, microBehavior);
    }

    @Override
    @Transactional
    public CreateRecipeResponse updateRecipe(Long userId, UpdateRecipeRequest request) {
        // 1. 获取微行为
        MicroBehavior microBehavior = microBehaviorMapper.selectById(request.getMicroBehaviorId());
        if (microBehavior == null) {
            throw new RuntimeException("微行为不存在");
        }
        if (!microBehavior.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作该微行为");
        }

        // 2. 更新微行为信息
        MicroBehaviorRequest mbRequest = request.getMicroBehavior();
        microBehavior.setName(mbRequest.getName());
        microBehavior.setIcon(mbRequest.getIcon());
        microBehavior.setAnchor(mbRequest.getAnchor());
        microBehavior.setBehavior(mbRequest.getBehavior());
        microBehavior.setCelebration(mbRequest.getCelebration());
        microBehavior.setDifficulty(mbRequest.getDifficulty() != null ? mbRequest.getDifficulty() : "easy");
        microBehavior.setFrequency(mbRequest.getFrequency());
        microBehavior.setReminderEnabled(mbRequest.getReminderEnabled() != null ? mbRequest.getReminderEnabled() : false);
        
        if (mbRequest.getReminderTime() != null && !mbRequest.getReminderTime().isEmpty()) {
            microBehavior.setReminderTime(LocalTime.parse(mbRequest.getReminderTime()));
        } else {
            microBehavior.setReminderTime(null);
        }
        
        microBehaviorMapper.updateById(microBehavior);

        // 3. 如果微行为绑定了习惯，且用户修改了习惯信息，则更新习惯
        Habit habit = null;
        boolean isNewHabit = false;
        
        if (microBehavior.getHabitId() != null) {
            habit = habitMapper.selectById(microBehavior.getHabitId());
            if (habit != null && habit.getUserId().equals(userId)) {
                // 更新习惯信息（如果提供了）
                if (request.getHabitName() != null && !request.getHabitName().trim().isEmpty()) {
                    habit.setName(request.getHabitName());
                }
                if (request.getHabitIcon() != null) {
                    habit.setIcon(request.getHabitIcon());
                }
                if (request.getHabitCategory() != null && !request.getHabitCategory().trim().isEmpty()) {
                    habit.setCategory(request.getHabitCategory());
                }
                if (request.getHabitDescription() != null) {
                    habit.setDescription(request.getHabitDescription());
                }
                habitMapper.updateById(habit);
            }
        }

        // 4. 构建响应
        CreateRecipeResponse.HabitInfo habitInfo = habit != null 
            ? new CreateRecipeResponse.HabitInfo(habit, isNewHabit) 
            : null;
        return new CreateRecipeResponse(habitInfo, microBehavior);
    }

    private MicroBehavior createMicroBehavior(Long userId, Long habitId, MicroBehaviorRequest request) {
        MicroBehavior microBehavior = new MicroBehavior();
        microBehavior.setUserId(userId);
        microBehavior.setHabitId(habitId);
        microBehavior.setName(request.getName());
        microBehavior.setIcon(request.getIcon());
        microBehavior.setAnchor(request.getAnchor());
        microBehavior.setBehavior(request.getBehavior());
        microBehavior.setCelebration(request.getCelebration());
        microBehavior.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "easy");
        microBehavior.setFrequency(request.getFrequency());
        microBehavior.setReminderEnabled(request.getReminderEnabled() != null ? request.getReminderEnabled() : false);
        
        if (request.getReminderTime() != null && !request.getReminderTime().isEmpty()) {
            microBehavior.setReminderTime(LocalTime.parse(request.getReminderTime()));
        }
        
        microBehavior.setSortOrder(0);
        microBehavior.setIsActive(true);

        microBehaviorMapper.insert(microBehavior);
        return microBehavior;
    }

    private void updateHabitMicroBehaviorIds(Long habitId, Long microBehaviorId) {
        Habit habit = habitMapper.selectById(habitId);
        
        try {
            // 获取现有的微行为ID列表
            List<Long> ids = new ArrayList<>();
            if (habit.getMicroBehaviorIds() != null && !habit.getMicroBehaviorIds().isEmpty()) {
                ids = objectMapper.readValue(habit.getMicroBehaviorIds(), new TypeReference<List<Long>>() {});
            }
            
            // 添加新的微行为ID
            ids.add(microBehaviorId);
            
            // 更新习惯
            habit.setMicroBehaviorIds(objectMapper.writeValueAsString(ids));
            habit.setMicroBehaviorCount(ids.size());
            habitMapper.updateById(habit);
        } catch (Exception e) {
            throw new RuntimeException("更新习惯微行为列���失败: " + e.getMessage());
        }
    }
}
