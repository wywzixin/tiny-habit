package com.tinyhabits.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class CreateRecipeRequest {
    private Long habitId;  // null=创建新习惯，有值=使用已有习惯
    private String habitName;
    private String habitIcon;
    private String habitCategory;
    private String habitDescription;
    
    @NotNull(message = "微行为信息不能为空")
    @Valid
    private MicroBehaviorRequest microBehavior;

    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }
    public String getHabitName() { return habitName; }
    public void setHabitName(String habitName) { this.habitName = habitName; }
    public String getHabitIcon() { return habitIcon; }
    public void setHabitIcon(String habitIcon) { this.habitIcon = habitIcon; }
    public String getHabitCategory() { return habitCategory; }
    public void setHabitCategory(String habitCategory) { this.habitCategory = habitCategory; }
    public String getHabitDescription() { return habitDescription; }
    public void setHabitDescription(String habitDescription) { this.habitDescription = habitDescription; }
    public MicroBehaviorRequest getMicroBehavior() { return microBehavior; }
    public void setMicroBehavior(MicroBehaviorRequest microBehavior) { this.microBehavior = microBehavior; }
}
