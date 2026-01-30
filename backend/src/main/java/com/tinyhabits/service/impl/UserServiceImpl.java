package com.tinyhabits.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.tinyhabits.dto.*;
import com.tinyhabits.entity.User;
import com.tinyhabits.mapper.UserMapper;
import com.tinyhabits.service.UserService;
import com.tinyhabits.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UserMapper userMapper, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String account = request.getAccount();
        
        // 判断是邮箱还是手机号
        boolean isEmail = account.contains("@");
        boolean isPhone = account.matches("\\d{6,}");
        
        if (!isEmail && !isPhone) {
            throw new RuntimeException("账号格式错误");
        }

        // 检查账号是否已存在
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (isEmail) {
            wrapper.eq(User::getEmail, account);
        } else {
            wrapper.eq(User::getPhone, account);
        }
        
        if (userMapper.selectOne(wrapper) != null) {
            throw new RuntimeException("账号已存在");
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        
        // 根据账号类型设置email或phone，另一个显式设置为null
        if (isEmail) {
            user.setEmail(account);
            user.setPhone(null);  // 显式设置为null
        } else {
            user.setPhone(account);
            user.setEmail(null);  // 显式设置为null
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setLevel(1);
        user.setTotalPoints(0);
        user.setAvailablePoints(0);
        user.setGender("unknown");

        userMapper.insert(user);

        // 生成 Token
        String token = jwtUtil.generateToken(user.getId(), account);
        
        return new LoginResponse(token, user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String account = request.getAccount();
        
        // 判断是邮箱还是手机号
        boolean isEmail = account.contains("@");
        
        // 查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (isEmail) {
            wrapper.eq(User::getEmail, account);
        } else {
            wrapper.eq(User::getPhone, account);
        }
        
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            throw new RuntimeException("账号不存在");
        }

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("账号或密码错误");
        }

        // 生成 Token
        String token = jwtUtil.generateToken(user.getId(), account);
        
        return new LoginResponse(token, user);
    }

    @Override
    public User getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    @Override
    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getById(userId);
        
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getGender() != null) {
            if (!request.getGender().matches("male|female|unknown")) {
                throw new RuntimeException("性别参数错误");
            }
            user.setGender(request.getGender());
        }
        
        userMapper.updateById(user);
        return user;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 验证两次密码是否一致
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("两次密码不一致");
        }

        String account = request.getAccount();
        boolean isEmail = account.contains("@");
        
        // 查询用户
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        if (isEmail) {
            queryWrapper.eq(User::getEmail, account);
        } else {
            queryWrapper.eq(User::getPhone, account);
        }
        
        User user = userMapper.selectOne(queryWrapper);
        if (user == null) {
            throw new RuntimeException("账号不存在");
        }

        // 使用 LambdaUpdateWrapper 显式更新密码字段
        String newPasswordHash = passwordEncoder.encode(request.getNewPassword());
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, user.getId())
                     .set(User::getPasswordHash, newPasswordHash);
        
        int updated = userMapper.update(null, updateWrapper);
        
        if (updated == 0) {
            throw new RuntimeException("密码更新失败");
        }
    }

    @Override
    @Transactional
    public void addPoints(Long userId, int points) {
        User user = getById(userId);
        user.setTotalPoints(user.getTotalPoints() + points);
        user.setAvailablePoints(user.getAvailablePoints() + points);
        userMapper.updateById(user);
    }

    @Override
    @Transactional
    public void deductPoints(Long userId, int points) {
        User user = getById(userId);
        if (user.getAvailablePoints() < points) {
            throw new RuntimeException("行动值不足");
        }
        user.setAvailablePoints(user.getAvailablePoints() - points);
        userMapper.updateById(user);
    }
}
