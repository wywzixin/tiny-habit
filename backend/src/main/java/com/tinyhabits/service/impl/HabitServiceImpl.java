package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyhabits.dto.HabitLibraryResponse;
import com.tinyhabits.dto.MicroBehaviorWithHabitResponse;
import com.tinyhabits.dto.MyHabitLibraryResponse;
import com.tinyhabits.entity.Habit;
import com.tinyhabits.entity.HabitLibrary;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.mapper.HabitLibraryMapper;
import com.tinyhabits.mapper.HabitMapper;
import com.tinyhabits.mapper.MicroBehaviorMapper;
import com.tinyhabits.service.HabitService;
import com.tinyhabits.service.MicroBehaviorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HabitServiceImpl implements HabitService {

    private final HabitMapper habitMapper;
    private final HabitLibraryMapper habitLibraryMapper;
    private final MicroBehaviorService microBehaviorService;
    private final MicroBehaviorMapper microBehaviorMapper;

    public HabitServiceImpl(HabitMapper habitMapper,
                           HabitLibraryMapper habitLibraryMapper,
                           MicroBehaviorService microBehaviorService,
                           MicroBehaviorMapper microBehaviorMapper) {
        this.habitMapper = habitMapper;
        this.habitLibraryMapper = habitLibraryMapper;
        this.microBehaviorService = microBehaviorService;
        this.microBehaviorMapper = microBehaviorMapper;
    }

    @Override
    @Transactional
    public Habit create(Habit habit) {
        habitMapper.insert(habit);
        return habit;
    }

    private List<Habit> getByUserId(Long userId) {
        LambdaQueryWrapper<Habit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Habit::getUserId, userId)
               .eq(Habit::getIsActive, true)
               .orderByDesc(Habit::getCreatedAt);
        return habitMapper.selectList(wrapper);
    }

    @Override
    public List<MyHabitLibraryResponse> getMyLibrary(Long userId) {
        List<Habit> habits = getByUserId(userId);
        
        return habits.stream().map(habit -> {
            boolean isFromSystem = habit.getSourceLibraryId() != null;
            return new MyHabitLibraryResponse(
                habit.getId(),
                habit.getName(),
                habit.getIcon(),
                habit.getCategory(),
                habit.getMicroBehaviorCount() != null ? habit.getMicroBehaviorCount() : 0,
                isFromSystem
            );
        }).collect(Collectors.toList());
    }

    @Override
    public List<MicroBehaviorWithHabitResponse> getUserMicroBehaviors(Long userId) {
        return microBehaviorService.getByUserIdWithHabit(userId);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Habit habit = habitMapper.selectById(id);
        if (habit == null) {
            throw new RuntimeException("习惯不存在");
        }
        
        // 检查是否为系统习惯（从习惯库添加的）
        if (habit.getSourceLibraryId() != null) {
            throw new RuntimeException("系统推荐的习惯不能删除");
        }
        
        // 软删除习惯
        habit.setIsActive(false);
        habitMapper.updateById(habit);
        
        // 级联软删除该习惯下的所有微行为
        LambdaQueryWrapper<MicroBehavior> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MicroBehavior::getHabitId, id)
               .eq(MicroBehavior::getIsActive, true);
        
        List<MicroBehavior> microBehaviors = microBehaviorService.getByHabitId(id);
        for (MicroBehavior mb : microBehaviors) {
            mb.setIsActive(false);
            microBehaviorMapper.updateById(mb);
        }
    }

    @Override
    public List<HabitLibraryResponse> getLibrary(Long userId, String category) {
        List<HabitLibraryResponse> result = new java.util.ArrayList<>();
        
        // 1. 获取用户自己创建的习惯
        List<Habit> userHabits = getByUserId(userId);
        for (Habit habit : userHabits) {
            result.add(new HabitLibraryResponse(
                habit.getId(),
                habit.getName(),
                habit.getIcon(),
                "新建",  // 用户创建的习惯分类默认为"新建"
                habit.getMicroBehaviorCount() != null ? habit.getMicroBehaviorCount() : 0
            ));
        }
        
        // 2. 获取系统习惯库
        LambdaQueryWrapper<HabitLibrary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HabitLibrary::getIsSystem, true);
        if (category != null && !category.isEmpty()) {
            wrapper.eq(HabitLibrary::getCategory, category);
        }
        wrapper.orderByDesc(HabitLibrary::getPopularity);
        
        List<HabitLibrary> systemHabits = habitLibraryMapper.selectList(wrapper);
        for (HabitLibrary habit : systemHabits) {
            result.add(new HabitLibraryResponse(
                habit.getId(),
                habit.getName(),
                habit.getIcon(),
                habit.getCategory(),
                habit.getDescription(),
                habit.getPopularity()
            ));
        }
        
        return result;
    }
}
