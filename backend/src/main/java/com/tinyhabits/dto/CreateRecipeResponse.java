package com.tinyhabits.dto;

import com.tinyhabits.entity.Habit;
import com.tinyhabits.entity.MicroBehavior;

public class CreateRecipeResponse {
    private HabitInfo habit;
    private MicroBehavior microBehavior;

    public CreateRecipeResponse() {}

    public CreateRecipeResponse(HabitInfo habit, MicroBehavior microBehavior) {
        this.habit = habit;
        this.microBehavior = microBehavior;
    }

    public HabitInfo getHabit() { return habit; }
    public void setHabit(HabitInfo habit) { this.habit = habit; }
    public MicroBehavior getMicroBehavior() { return microBehavior; }
    public void setMicroBehavior(MicroBehavior microBehavior) { this.microBehavior = microBehavior; }

    public static class HabitInfo {
        private Long id;
        private String name;
        private String icon;
        private String category;
        private Boolean isNew;  // 是否是新创建的习惯

        public HabitInfo() {}

        public HabitInfo(Habit habit, Boolean isNew) {
            this.id = habit.getId();
            this.name = habit.getName();
            this.icon = habit.getIcon();
            this.category = habit.getCategory();
            this.isNew = isNew;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Boolean getIsNew() { return isNew; }
        public void setIsNew(Boolean isNew) { this.isNew = isNew; }
    }
}
