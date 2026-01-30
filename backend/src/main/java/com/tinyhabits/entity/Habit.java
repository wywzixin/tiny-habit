package com.tinyhabits.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

@TableName("habit")
public class Habit {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String name;
    private String icon;
    private String category;
    private String description;
    private String microBehaviorIds;
    private Integer microBehaviorCount;
    private Long sourceLibraryId;
    private Boolean isActive;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMicroBehaviorIds() { return microBehaviorIds; }
    public void setMicroBehaviorIds(String microBehaviorIds) { this.microBehaviorIds = microBehaviorIds; }
    public Integer getMicroBehaviorCount() { return microBehaviorCount; }
    public void setMicroBehaviorCount(Integer microBehaviorCount) { this.microBehaviorCount = microBehaviorCount; }
    public Long getSourceLibraryId() { return sourceLibraryId; }
    public void setSourceLibraryId(Long sourceLibraryId) { this.sourceLibraryId = sourceLibraryId; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
