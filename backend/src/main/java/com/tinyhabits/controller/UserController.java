package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import com.tinyhabits.dto.*;
import com.tinyhabits.entity.User;
import com.tinyhabits.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            LoginResponse response = userService.register(request);
            return Result.success(response);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("账号已存在")) {
                return Result.error(402, e.getMessage());
            } else if (e.getMessage().equals("账号格式错误")) {
                return Result.error(407, e.getMessage());
            }
            return Result.error(e.getMessage());
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return Result.success(response);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("账号不存在")) {
                return Result.error(403, e.getMessage());
            } else if (e.getMessage().equals("账号或密码错误")) {
                return Result.error(405, e.getMessage());
            }
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        try {
            return Result.success(userService.getById(id));
        } catch (RuntimeException e) {
            return Result.error(404, e.getMessage());
        }
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/profile")
    public Result<User> updateProfile(
            @RequestAttribute("userId") Long userId,
            @RequestBody UpdateProfileRequest request) {
        try {
            User user = userService.updateProfile(userId, request);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 重置密码
     */
    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request);
            return Result.success();
        } catch (RuntimeException e) {
            if (e.getMessage().equals("账号不存在")) {
                return Result.error(403, e.getMessage());
            } else if (e.getMessage().equals("两次密码不一致")) {
                return Result.error(406, e.getMessage());
            }
            return Result.error(e.getMessage());
        }
    }
}
