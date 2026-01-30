package com.tinyhabits.service;

import com.tinyhabits.dto.LoginResponse;
import com.tinyhabits.dto.RegisterRequest;
import com.tinyhabits.dto.LoginRequest;
import com.tinyhabits.dto.ResetPasswordRequest;
import com.tinyhabits.dto.UpdateProfileRequest;
import com.tinyhabits.entity.User;

public interface UserService {
    LoginResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    User getById(Long id);
    User updateProfile(Long userId, UpdateProfileRequest request);
    void resetPassword(ResetPasswordRequest request);
    void addPoints(Long userId, int points);
    void deductPoints(Long userId, int points);
}
