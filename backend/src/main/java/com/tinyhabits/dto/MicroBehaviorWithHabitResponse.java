package com.tinyhabits.dto;

import com.tinyhabits.entity.MicroBehavior;

public class MicroBehaviorWithHabitResponse {
    private Long id;
    private Long habitId;
    private String habitName;
    private String habitIcon;
    private String name;
    private String icon;
    private String anchor;
    private String behavior;
    private String celebration;
    private String difficulty;
    private String frequency;
    private Boolean reminderEnabled;
    private String reminderTime;
    private Boolean isActive;

    public MicroBehaviorWithHabitResponse() {}

    public MicroBehaviorWithHabitResponse(MicroBehavior mb, String habitName, String habitIcon) {
        this.id = mb.getId();
        this.habitId = mb.getHabitId();
        this.habitName = habitName;
        this.habitIcon = habitIcon;
        this.name = mb.getName();
        this.icon = mb.getIcon();
        this.anchor = mb.getAnchor();
        this.behavior = mb.getBehavior();
        this.celebration = mb.getCelebration();
        this.difficulty = mb.getDifficulty();
        this.frequency = mb.getFrequency();
        this.reminderEnabled = mb.getReminderEnabled();
        this.reminderTime = mb.getReminderTime() != null ? mb.getReminderTime().toString() : null;
        this.isActive = mb.getIsActive();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }
    public String getHabitName() { return habitName; }
    public void setHabitName(String habitName) { this.habitName = habitName; }
    public String getHabitIcon() { return habitIcon; }
    public void setHabitIcon(String habitIcon) { this.habitIcon = habitIcon; }
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
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
