package com.tinyhabits.dto;

import jakarta.validation.constraints.NotBlank;

public class MicroBehaviorRequest {
    @NotBlank(message = "微行为名称不能为空")
    private String name;
    
    private String icon;
    
    @NotBlank(message = "锚点不能为空")
    private String anchor;
    
    @NotBlank(message = "行为不能为空")
    private String behavior;
    
    @NotBlank(message = "庆祝方式不能为空")
    private String celebration;
    
    private String difficulty;
    
    @NotBlank(message = "频率不能为空")
    private String frequency;
    
    private Boolean reminderEnabled;
    private String reminderTime;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getAnchor() { return anchor; }
    public void setAnchor(String anchor) { this.anchor = anchor; }
    public String getBehavior() { return behavior; }
    public void setBehavior(String behavior) { this.behavior = behavior; }
    public String getCelebration() { return celebration; }
    public void setCelebration(String celebration) { this.celebration = celebration; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public Boolean getReminderEnabled() { return reminderEnabled; }
    public void setReminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
}
