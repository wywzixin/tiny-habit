package com.tinyhabits.dto;

public class MyHabitLibraryResponse {
    private Long id;
    private String name;
    private String icon;
    private String category;
    private Integer microBehaviorCount;
    private Boolean isFromSystem;  // 是否来自系统预设

    public MyHabitLibraryResponse() {}

    public MyHabitLibraryResponse(Long id, String name, String icon, String category, 
                                  Integer microBehaviorCount, Boolean isFromSystem) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.category = category;
        this.microBehaviorCount = microBehaviorCount;
        this.isFromSystem = isFromSystem;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getMicroBehaviorCount() { return microBehaviorCount; }
    public void setMicroBehaviorCount(Integer microBehaviorCount) { this.microBehaviorCount = microBehaviorCount; }
    public Boolean getIsFromSystem() { return isFromSystem; }
    public void setIsFromSystem(Boolean isFromSystem) { this.isFromSystem = isFromSystem; }
}
