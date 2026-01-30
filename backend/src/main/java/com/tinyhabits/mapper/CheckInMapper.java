package com.tinyhabits.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tinyhabits.entity.CheckIn;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CheckInMapper extends BaseMapper<CheckIn> {
}
