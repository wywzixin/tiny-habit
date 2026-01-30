package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyhabits.dto.MicroBehaviorWithHabitResponse;
import com.tinyhabits.entity.BehaviorRecipeTemplate;
import com.tinyhabits.entity.Habit;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.mapper.BehaviorRecipeTemplateMapper;
import com.tinyhabits.mapper.HabitMapper;
import com.tinyhabits.mapper.MicroBehaviorMapper;
import com.tinyhabits.service.MicroBehaviorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MicroBehaviorServiceImpl implements MicroBehaviorService {

    private final MicroBehaviorMapper microBehaviorMapper;
    private final HabitMapper habitMapper;
    private final BehaviorRecipeTemplateMapper templateMapper;

    public MicroBehaviorServiceImpl(MicroBehaviorMapper microBehaviorMapper, 
                                   HabitMapper habitMapper,
                                   BehaviorRecipeTemplateMapper templateMapper) {
        this.microBehaviorMapper = microBehaviorMapper;
        this.habitMapper = habitMapper;
        this.templateMapper = templateMapper;
    }

    @Override
    @Transactional
    public MicroBehavior create(MicroBehavior microBehavior) {
        microBehaviorMapper.insert(microBehavior);
        return microBehavior;
    }

    @Override
    public MicroBehavior getById(Long id) {
        MicroBehavior microBehavior = microBehaviorMapper.selectById(id);
        if (microBehavior == null) {
            throw new RuntimeException("微行为不存在");
        }
        return microBehavior;
    }

    @Override
    public List<MicroBehavior> getByUserId(Long userId) {
        LambdaQueryWrapper<MicroBehavior> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MicroBehavior::getUserId, userId)
               .eq(MicroBehavior::getIsActive, true)
               .orderByAsc(MicroBehavior::getSortOrder)
               .orderByDesc(MicroBehavior::getCreatedAt);
        return microBehaviorMapper.selectList(wrapper);
    }

    @Override
    public List<MicroBehaviorWithHabitResponse> getByUserIdWithHabit(Long userId) {
        List<MicroBehavior> microBehaviors = getByUserId(userId);
        
        return microBehaviors.stream().map(mb -> {
            String habitName = null;
            String habitIcon = null;
            
            // 处理 habitId 为 null 的情况
            if (mb.getHabitId() != null) {
                Habit habit = habitMapper.selectById(mb.getHabitId());
                if (habit != null) {
                    habitName = habit.getName();
                    habitIcon = habit.getIcon();
                }
            }
            
            return new MicroBehaviorWithHabitResponse(mb, habitName, habitIcon);
        }).collect(Collectors.toList());
    }

    @Override
    public List<MicroBehavior> getByHabitId(Long habitId) {
        LambdaQueryWrapper<MicroBehavior> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MicroBehavior::getHabitId, habitId)
               .eq(MicroBehavior::getIsActive, true)
               .orderByAsc(MicroBehavior::getSortOrder)
               .orderByDesc(MicroBehavior::getCreatedAt);
        return microBehaviorMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        MicroBehavior microBehavior = getById(id);
        microBehavior.setIsActive(false);
        microBehaviorMapper.updateById(microBehavior);
    }

    @Override
    @Transactional
    public MicroBehavior addFromTemplate(Long userId, Long templateId, String frequency, Boolean reminderEnabled, String reminderTime) {
        // 1. 查询配方模板
        BehaviorRecipeTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            throw new RuntimeException("配方模板不存在");
        }
        
        // 2. 创建微行为
        MicroBehavior microBehavior = new MicroBehavior();
        microBehavior.setUserId(userId);
        microBehavior.setHabitId(null);  // 不绑定习惯
        microBehavior.setSourceTemplateId(templateId);  // 记录来源模板ID
        
        // 从模板复制数据
        microBehavior.setName(template.getName());
        microBehavior.setIcon(template.getIcon());
        microBehavior.setAnchor(template.getAnchor());
        microBehavior.setBehavior(template.getBehavior());
        microBehavior.setCelebration(template.getCelebration());
        microBehavior.setDifficulty(template.getDifficulty());
        
        // 从请求参数设置
        microBehavior.setFrequency(frequency != null ? frequency : "[1,2,3,4,5,6,7]");
        microBehavior.setReminderEnabled(reminderEnabled != null ? reminderEnabled : false);
        
        // 转换reminderTime从String到LocalTime
        if (reminderTime != null && !reminderTime.isEmpty()) {
            microBehavior.setReminderTime(LocalTime.parse(reminderTime));
        } else {
            microBehavior.setReminderTime(null);
        }
        
        microBehavior.setIsActive(true);
        microBehavior.setSortOrder(0);
        
        // 3. 保存微行为
        microBehaviorMapper.insert(microBehavior);
        
        // 4. 更新模板热度
        template.setPopularity(template.getPopularity() + 1);
        templateMapper.updateById(template);
        
        return microBehavior;
    }
}
