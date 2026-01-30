package com.tinyhabits.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

@TableName("habit_library")
public class HabitLibrary {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long sourceHabitId;
    private Long sourceUserId;
    private String category;
    private String name;
    private String icon;
    private String description;
    private String suggestedAnchors;
    private String suggestedBehaviors;
    private String suggestedCelebrations;
    private String difficulty;
    private Boolean isSystem;
    private Integer popularity;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSourceHabitId() { return sourceHabitId; }
    public void setSourceHabitId(Long sourceHabitId) { this.sourceHabitId = sourceHabitId; }
    public Long getSourceUserId() { return sourceUserId; }
    public void setSourceUserId(Long sourceUserId) { this.sourceUserId = sourceUserId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSuggestedAnchors() { return suggestedAnchors; }
    public void setSuggestedAnchors(String suggestedAnchors) { this.suggestedAnchors = suggestedAnchors; }
    public String getSuggestedBehaviors() { return suggestedBehaviors; }
    public void setSuggestedBehaviors(String suggestedBehaviors) { this.suggestedBehaviors = suggestedBehaviors; }
    public String getSuggestedCelebrations() { return suggestedCelebrations; }
    public void setSuggestedCelebrations(String suggestedCelebrations) { this.suggestedCelebrations = suggestedCelebrations; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }
    public Integer getPopularity() { return popularity; }
    public void setPopularity(Integer popularity) { this.popularity = popularity; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
