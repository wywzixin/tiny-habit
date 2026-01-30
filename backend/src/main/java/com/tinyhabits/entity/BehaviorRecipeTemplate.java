package com.tinyhabits.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

@TableName("behavior_recipe_template")
public class BehaviorRecipeTemplate {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long sourceMicroBehaviorId;
    private Long sourceUserId;
    private String category;
    private String name;
    private String icon;
    private String anchor;
    private String behavior;
    private String celebration;
    private String difficulty;
    private Boolean isSystem;
    private Integer popularity;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSourceMicroBehaviorId() { return sourceMicroBehaviorId; }
    public void setSourceMicroBehaviorId(Long sourceMicroBehaviorId) { this.sourceMicroBehaviorId = sourceMicroBehaviorId; }
    public Long getSourceUserId() { return sourceUserId; }
    public void setSourceUserId(Long sourceUserId) { this.sourceUserId = sourceUserId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
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
    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }
    public Integer getPopularity() { return popularity; }
    public void setPopularity(Integer popularity) { this.popularity = popularity; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
