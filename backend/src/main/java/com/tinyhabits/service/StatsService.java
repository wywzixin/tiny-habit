package com.tinyhabits.service;

import com.tinyhabits.dto.TodayCheckInResponse;

import java.util.List;
import java.util.Map;

public interface StatsService {
    Map<String, Object> getUserStats(Long userId);
    List<TodayCheckInResponse> getTodayCheckIns(Long userId);
}
