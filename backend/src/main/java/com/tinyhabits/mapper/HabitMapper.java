package com.tinyhabits.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyhabits.entity.Habit;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HabitMapper extends BaseMapper<Habit> {
}
