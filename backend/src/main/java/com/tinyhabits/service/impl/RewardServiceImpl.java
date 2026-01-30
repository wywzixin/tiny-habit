package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.tinyhabits.entity.Reward;
import com.tinyhabits.entity.User;
import com.tinyhabits.mapper.RewardMapper;
import com.tinyhabits.mapper.UserMapper;
import com.tinyhabits.service.RewardService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RewardServiceImpl implements RewardService {

    private final RewardMapper rewardMapper;
    private final UserMapper userMapper;

    public RewardServiceImpl(RewardMapper rewardMapper, UserMapper userMapper) {
        this.rewardMapper = rewardMapper;
        this.userMapper = userMapper;
    }

    @Override
    public Reward create(Reward reward) {
        reward.setStatus("pending");
        rewardMapper.insert(reward);
        return reward;
    }

    @Override
    public List<Reward> getByUserId(Long userId) {
        QueryWrapper<Reward> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        return rewardMapper.selectList(wrapper);
    }

    @Override
    public Reward redeem(Long id, Long userId) {
        Reward reward = rewardMapper.selectById(id);
        if (reward == null) {
            throw new RuntimeException("奖励不存在");
        }
        User user = userMapper.selectById(userId);
        if (user.getAvailablePoints() < reward.getCost()) {
            throw new RuntimeException("行动值不足");
        }
        user.setAvailablePoints(user.getAvailablePoints() - reward.getCost());
        userMapper.updateById(user);
        reward.setStatus("redeemed");
        reward.setRedeemedAt(LocalDateTime.now());
        rewardMapper.updateById(reward);
        return reward;
    }
}
