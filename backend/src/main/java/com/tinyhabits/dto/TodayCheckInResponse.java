package com.tinyhabits.dto;

import java.time.LocalDateTime;

/**
 * 今日打卡响应DTO（发光时刻）
 */
public class TodayCheckInResponse {
    private String icon;           // 微行为图标
    private String behavior;       // 行为描述
    private String celebration;    // 庆祝方式
    private LocalDateTime checkedAt;  // 打卡时间
    private Integer pointsEarned;  // 本次积分

    public TodayCheckInResponse() {
    }

    public TodayCheckInResponse(String icon, String behavior, String celebration, 
                               LocalDateTime checkedAt, Integer pointsEarned) {
        this.icon = icon;
        this.behavior = behavior;
        this.celebration = celebration;
        this.checkedAt = checkedAt;
        this.pointsEarned = pointsEarned;
    }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public String getBehavior() { return behavior; }
    public void setBehavior(String behavior) { this.behavior = behavior; }
    
    public String getCelebration() { return celebration; }
    public void setCelebration(String celebration) { this.celebration = celebration; }
    
    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }
    
    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
}
