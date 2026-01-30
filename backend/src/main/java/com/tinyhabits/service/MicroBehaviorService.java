package com.tinyhabits.service;

import com.tinyhabits.dto.MicroBehaviorWithHabitResponse;
import com.tinyhabits.entity.MicroBehavior;
import java.util.List;

public interface MicroBehaviorService {
    MicroBehavior create(MicroBehavior microBehavior);
    MicroBehavior getById(Long id);
    List<MicroBehavior> getByUserId(Long userId);
    List<MicroBehaviorWithHabitResponse> getByUserIdWithHabit(Long userId);
    List<MicroBehavior> getByHabitId(Long habitId);
    void delete(Long id);
    MicroBehavior addFromTemplate(Long userId, Long templateId, String frequency, Boolean reminderEnabled, String reminderTime);
}
