package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.tinyhabits.dto.TodayCheckInResponse;
import com.tinyhabits.entity.CheckIn;
import com.tinyhabits.entity.Habit;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.entity.User;
import com.tinyhabits.mapper.CheckInMapper;
import com.tinyhabits.mapper.HabitMapper;
import com.tinyhabits.mapper.MicroBehaviorMapper;
import com.tinyhabits.mapper.UserMapper;
import com.tinyhabits.service.StatsService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsServiceImpl implements StatsService {

    private final UserMapper userMapper;
    private final HabitMapper habitMapper;
    private final MicroBehaviorMapper microBehaviorMapper;
    private final CheckInMapper checkInMapper;

    public StatsServiceImpl(UserMapper userMapper, HabitMapper habitMapper, 
                           MicroBehaviorMapper microBehaviorMapper, CheckInMapper checkInMapper) {
        this.userMapper = userMapper;
        this.habitMapper = habitMapper;
        this.microBehaviorMapper = microBehaviorMapper;
        this.checkInMapper = checkInMapper;
    }

    @Override
    public Map<String, Object> getUserStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 用户基本信息
        User user = userMapper.selectById(userId);
        if (user != null) {
            stats.put("totalPoints", user.getTotalPoints());
            stats.put("availablePoints", user.getAvailablePoints());
            stats.put("level", user.getLevel());
        }
        
        // 习惯数量
        QueryWrapper<Habit> habitWrapper = new QueryWrapper<>();
        habitWrapper.eq("user_id", userId).eq("is_active", true);
        stats.put("habitCount", habitMapper.selectCount(habitWrapper));
        
        // 微行为数量
        QueryWrapper<MicroBehavior> mbWrapper = new QueryWrapper<>();
        mbWrapper.eq("user_id", userId).eq("is_active", true);
        stats.put("microBehaviorCount", microBehaviorMapper.selectCount(mbWrapper));
        
        // 总打卡次数
        QueryWrapper<CheckIn> checkInWrapper = new QueryWrapper<>();
        checkInWrapper.eq("user_id", userId);
        stats.put("checkInCount", checkInMapper.selectCount(checkInWrapper));
        
        return stats;
    }

    @Override
    public List<TodayCheckInResponse> getTodayCheckIns(Long userId) {
        // 获取今天的开始和结束时间
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        // 查询今天的打卡记录，按打卡时间倒序
        QueryWrapper<CheckIn> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
               .ge("checked_at", startOfDay)
               .lt("checked_at", endOfDay)
               .orderByDesc("checked_at");
        
        List<CheckIn> todayCheckIns = checkInMapper.selectList(wrapper);
        
        // 组装返回数据
        return todayCheckIns.stream()
                .map(checkIn -> {
                    // 通过 microBehaviorId 关联查询微行为信息
                    MicroBehavior microBehavior = microBehaviorMapper.selectById(checkIn.getMicroBehaviorId());
                    
                    if (microBehavior != null) {
                        return new TodayCheckInResponse(
                            microBehavior.getIcon(),
                            microBehavior.getBehavior(),
                            microBehavior.getCelebration(),
                            checkIn.getCheckedAt(),
                            checkIn.getPointsEarned()
                        );
                    }
                    return null;
                })
                .filter(Objects::nonNull)  // 过滤掉 null 值
                .collect(Collectors.toList());
    }
}
