package com.tinyhabits.service;

import com.tinyhabits.entity.CheckIn;
import java.util.List;
import java.util.Map;

public interface CheckInService {
    CheckIn checkIn(Long microBehaviorId, Long habitId, Long userId);
    List<CheckIn> getByUserId(Long userId);
    List<CheckIn> getByMicroBehaviorId(Long microBehaviorId);
    List<CheckIn> getTodayByUserId(Long userId);
    Map<String, Object> cancelCheckIn(Long microBehaviorId, Long habitId, Long userId);
}
