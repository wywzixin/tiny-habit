package com.tinyhabits.service;

import com.tinyhabits.entity.Reward;
import java.util.List;

public interface RewardService {
    Reward create(Reward reward);
    List<Reward> getByUserId(Long userId);
    Reward redeem(Long id, Long userId);
}
