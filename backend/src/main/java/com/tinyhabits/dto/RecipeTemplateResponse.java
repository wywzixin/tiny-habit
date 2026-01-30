package com.tinyhabits.dto;

import com.tinyhabits.entity.BehaviorRecipeTemplate;

/**
 * 配方模板响应DTO
 * 包含模板信息和用户是否已添加的标识
 */
public class RecipeTemplateResponse {
    private Long id;
    private String category;
    private String name;
    private String icon;
    private String anchor;
    private String behavior;
    private String celebration;
    private String difficulty;
    private Boolean isSystem;
    private Integer popularity;
    private Boolean isAdded;  // 当前用户是否已添加该配方

    public RecipeTemplateResponse() {
    }

    public RecipeTemplateResponse(BehaviorRecipeTemplate template, Boolean isAdded) {
        this.id = template.getId();
        this.category = template.getCategory();
        this.name = template.getName();
        this.icon = template.getIcon();
        this.anchor = template.getAnchor();
        this.behavior = template.getBehavior();
        this.celebration = template.getCelebration();
        this.difficulty = template.getDifficulty();
        this.isSystem = template.getIsSystem();
        this.popularity = template.getPopularity();
        this.isAdded = isAdded;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Boolean getIsAdded() { return isAdded; }
    public void setIsAdded(Boolean isAdded) { this.isAdded = isAdded; }
}
