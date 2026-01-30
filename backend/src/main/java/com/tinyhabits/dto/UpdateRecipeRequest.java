package com.tinyhabits.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class UpdateRecipeRequest {
    @NotNull(message = "微行为ID不能为空")
    private Long microBehaviorId;
    
    // 习惯信息（可选，如果用户修改了习惯名称）
    private String habitName;
    private String habitIcon;
    private String habitCategory;
    private String habitDescription;
    
    // 微行为信息
    @NotNull(message = "微行为信息不能为空")
    @Valid
    private MicroBehaviorRequest microBehavior;

    public Long getMicroBehaviorId() { return microBehaviorId; }
    public void setMicroBehaviorId(Long microBehaviorId) { this.microBehaviorId = microBehaviorId; }
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
