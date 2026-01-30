package com.tinyhabits.service;

import com.tinyhabits.dto.HabitLibraryResponse;
import com.tinyhabits.dto.MicroBehaviorWithHabitResponse;
import com.tinyhabits.dto.MyHabitLibraryResponse;
import com.tinyhabits.entity.Habit;
import java.util.List;

public interface HabitService {
    Habit create(Habit habit);
    List<MyHabitLibraryResponse> getMyLibrary(Long userId);
    List<MicroBehaviorWithHabitResponse> getUserMicroBehaviors(Long userId);
    void delete(Long id);
    List<HabitLibraryResponse> getLibrary(Long userId, String category);
}
