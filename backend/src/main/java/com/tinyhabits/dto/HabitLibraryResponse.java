package com.tinyhabits.dto;

public class HabitLibraryResponse {
    private Long id;
    private String name;
    private String icon;
    private String category;
    private String source;  // "user" 或 "system"
    private Integer microBehaviorCount;  // 仅用户习惯有值
    private String description;
    private Integer popularity;  // 仅系统习惯有值

    // 用户习惯的构造函数
    public HabitLibraryResponse(Long id, String name, String icon, String category, 
                               Integer microBehaviorCount) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.category = category;
        this.source = "user";
        this.microBehaviorCount = microBehaviorCount;
    }

    // 系统习惯的构造函数
    public HabitLibraryResponse(Long id, String name, String icon, String category, 
                               String description, Integer popularity) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.category = category;
        this.source = "system";
        this.description = description;
        this.popularity = popularity;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    
    public Integer getMicroBehaviorCount() { return microBehaviorCount; }
    public void setMicroBehaviorCount(Integer microBehaviorCount) { 
        this.microBehaviorCount = microBehaviorCount; 
    }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getPopularity() { return popularity; }
    public void setPopularity(Integer popularity) { this.popularity = popularity; }
}
