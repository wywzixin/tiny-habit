package com.tinyhabits.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyhabits.entity.HabitLibrary;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HabitLibraryMapper extends BaseMapper<HabitLibrary> {
}
