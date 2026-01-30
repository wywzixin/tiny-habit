package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tinyhabits.entity.CheckIn;
import com.tinyhabits.entity.MicroBehavior;
import com.tinyhabits.mapper.CheckInMapper;
import com.tinyhabits.service.CheckInService;
import com.tinyhabits.service.MicroBehaviorService;
import com.tinyhabits.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CheckInServiceImpl implements CheckInService {

    private final CheckInMapper checkInMapper;
    private final UserService userService;
    private final MicroBehaviorService microBehaviorService;

    public CheckInServiceImpl(CheckInMapper checkInMapper, 
                             UserService userService,
                             MicroBehaviorService microBehaviorService) {
        this.checkInMapper = checkInMapper;
        this.userService = userService;
        this.microBehaviorService = microBehaviorService;
    }

    @Override
    @Transactional
    public CheckIn checkIn(Long microBehaviorId, Long habitId, Long userId) {
        // 验证微行为是否存在
        MicroBehavior microBehavior = microBehaviorService.getById(microBehaviorId);
        if (!microBehavior.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作该微行为");
        }

        // 检查今天是否已经打卡
        if (hasTodayCheckIn(microBehaviorId, userId)) {
            throw new RuntimeException("今天已经打卡过了");
        }

        // 创建打卡记录
        CheckIn checkIn = new CheckIn();
        checkIn.setMicroBehaviorId(microBehaviorId);
        checkIn.setHabitId(habitId);
        checkIn.setUserId(userId);
        checkIn.setCheckedAt(LocalDateTime.now());
        checkIn.setPointsEarned(10);  // 每次打卡获得10个行动值

        checkInMapper.insert(checkIn);

        // 增加用户行动值
        userService.addPoints(userId, 10);

        return checkIn;
    }

    @Override
    public List<CheckIn> getByUserId(Long userId) {
        LambdaQueryWrapper<CheckIn> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CheckIn::getUserId, userId)
               .orderByDesc(CheckIn::getCheckedAt);
        return checkInMapper.selectList(wrapper);
    }

    @Override
    public List<CheckIn> getByMicroBehaviorId(Long microBehaviorId) {
        LambdaQueryWrapper<CheckIn> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CheckIn::getMicroBehaviorId, microBehaviorId)
               .orderByDesc(CheckIn::getCheckedAt);
        return checkInMapper.selectList(wrapper);
    }

    @Override
    public List<CheckIn> getTodayByUserId(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        LambdaQueryWrapper<CheckIn> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CheckIn::getUserId, userId)
               .between(CheckIn::getCheckedAt, startOfDay, endOfDay)
               .orderByDesc(CheckIn::getCheckedAt);
        return checkInMapper.selectList(wrapper);
    }

    /**
     * 检查今天是否已经打卡
     */
    private boolean hasTodayCheckIn(Long microBehaviorId, Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        LambdaQueryWrapper<CheckIn> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CheckIn::getMicroBehaviorId, microBehaviorId)
               .eq(CheckIn::getUserId, userId)
               .between(CheckIn::getCheckedAt, startOfDay, endOfDay);

        return checkInMapper.selectCount(wrapper) > 0;
    }

    @Override
    @Transactional
    public Map<String, Object> cancelCheckIn(Long microBehaviorId, Long habitId, Long userId) {
        // 1. 查询今天的打卡记录
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        LambdaQueryWrapper<CheckIn> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CheckIn::getMicroBehaviorId, microBehaviorId)
               .eq(CheckIn::getUserId, userId)
               .between(CheckIn::getCheckedAt, startOfDay, endOfDay);
        
        // habitId 可能为 null（从配方库添加的微行为）
        if (habitId != null) {
            wrapper.eq(CheckIn::getHabitId, habitId);
        } else {
            wrapper.isNull(CheckIn::getHabitId);
        }
        
        CheckIn checkIn = checkInMapper.selectOne(wrapper);
        
        // 2. 验证打卡记录是否存在
        if (checkIn == null) {
            throw new RuntimeException("今天还没有打卡记录");
        }

        // 3. 获取积分数
        Integer pointsEarned = checkIn.getPointsEarned();

        // 4. 删除打卡记录
        checkInMapper.deleteById(checkIn.getId());

        // 5. 扣除用户积分
        userService.deductPoints(userId, pointsEarned);

        // 6. 返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("pointsDeducted", pointsEarned);
        return result;
    }
}
