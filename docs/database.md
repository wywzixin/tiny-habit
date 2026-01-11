# Tiny Habits - 数据库设计文档

> 版本：v1.0
> 更新日期：2026-01-11

## 1. 数据库概述

### 1.1 数据库选型

| 配置 | 值 |
|-----|-----|
| 数据库 | MySQL 8.0+ |
| 字符集 | utf8mb4 |
| 排序规则 | utf8mb4_unicode_ci |
| 存储引擎 | InnoDB |

### 1.2 命名规范

- **表名**：小写 + 下划线（如：`user`, `habit`, `check_in`）
- **字段名**：小写 + 下划线（如：`user_id`, `created_at`）
- **主键**：统一使用 `id`
- **外键**：`{表名}_id`（如：`user_id`, `habit_id`）
- **时间戳**：`created_at`, `updated_at`

---

## 2. 核心表结构

### 2.1 用户表（user）

```sql
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `level` INT UNSIGNED DEFAULT 1,
  `total_points` INT UNSIGNED DEFAULT 0,
  `available_points` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.2 习惯表（habit）- 父习惯

```sql
CREATE TABLE `habit` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT '习惯名称，如：健康生活、高效工作',
  `icon` VARCHAR(10) DEFAULT NULL COMMENT '习惯图标',
  `category` VARCHAR(50) NOT NULL DEFAULT '生活' COMMENT '分类：健康/学习/生活/心理/社交',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '习惯描述',
  `micro_behavior_ids` JSON DEFAULT NULL COMMENT '关联的微行为ID数组',
  `is_active` TINYINT(1) DEFAULT 1,
  `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开到习惯库',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.3 微行为表（micro_behavior）- 子行为

```sql
CREATE TABLE `micro_behavior` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `habit_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的父习惯ID',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT '微行为名称',
  `icon` VARCHAR(10) DEFAULT NULL,
  `anchor` VARCHAR(200) NOT NULL COMMENT '锚点行为',
  `behavior` VARCHAR(200) NOT NULL COMMENT '微行为内容',
  `celebration` VARCHAR(100) NOT NULL COMMENT '庆祝方式',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `frequency` JSON NOT NULL COMMENT '频率设置 [1,2,3,4,5,6,7]',
  `reminder_enabled` TINYINT(1) DEFAULT 0,
  `reminder_time` TIME DEFAULT NULL,
  `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序顺序',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_habit_id` (`habit_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.4 打卡记录表（check_in）

```sql
CREATE TABLE `check_in` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `micro_behavior_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的微行为ID',
  `habit_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的父习惯ID（冗余字段，便于查询）',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `checked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `points_earned` INT UNSIGNED DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_micro_behavior_id` (`micro_behavior_id`),
  KEY `idx_habit_id` (`habit_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_checked_at` (`checked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.5 奖励表（reward）

```sql
CREATE TABLE `reward` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) NOT NULL COMMENT '奖励图标',
  `cost` INT UNSIGNED NOT NULL COMMENT '所需行动值',
  `status` ENUM('pending', 'redeemed') DEFAULT 'pending',
  `redeemed_at` TIMESTAMP DEFAULT NULL COMMENT '兑换时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.6 成就表（achievement）

```sql
CREATE TABLE `achievement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.7 习惯库表（habit_library）

```sql
CREATE TABLE `habit_library` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_habit_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '来源习惯ID（用户分享时）',
  `source_user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '来源用户ID',
  `category` VARCHAR(50) NOT NULL COMMENT '分类：推荐/健康/学习/生活/心理/社交',
  `name` VARCHAR(100) NOT NULL COMMENT '习惯名称',
  `icon` VARCHAR(10) DEFAULT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `suggested_anchors` JSON NOT NULL COMMENT '推荐锚点列表',
  `suggested_behaviors` JSON NOT NULL COMMENT '推荐微行为列表',
  `suggested_celebrations` JSON DEFAULT NULL COMMENT '推荐庆祝方式',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `is_system` TINYINT(1) DEFAULT 0 COMMENT '是否系统预设',
  `popularity` INT UNSIGNED DEFAULT 0 COMMENT '热度/使用次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.8 微行为配方模板表（behavior_recipe_template）

```sql
CREATE TABLE `behavior_recipe_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_micro_behavior_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '来源微行为ID（用户分享时）',
  `source_user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '来源用户ID',
  `category` VARCHAR(50) NOT NULL COMMENT '分类：推荐/健康/学习/生活/心理/社交',
  `name` VARCHAR(100) NOT NULL COMMENT '配方名称',
  `icon` VARCHAR(10) DEFAULT NULL,
  `anchor` VARCHAR(200) NOT NULL COMMENT '锚点行为',
  `behavior` VARCHAR(200) NOT NULL COMMENT '微行为内容',
  `celebration` VARCHAR(100) NOT NULL COMMENT '庆祝方式',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `is_system` TINYINT(1) DEFAULT 0 COMMENT '是否系统预设',
  `popularity` INT UNSIGNED DEFAULT 0 COMMENT '热度/使用次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. 表关系说明

```
┌─────────────────────────────────────────────────────────────┐
│                        数据模型关系                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  user (用户)                                                │
│    │                                                        │
│    ├──< habit (父习惯) [含 micro_behavior_ids 数组]         │
│    │      │                                                 │
│    │      └──< micro_behavior (微行为)                      │
│    │             │                                          │
│    │             └──< check_in (打卡记录)                   │
│    │                                                        │
│    ├──< reward (奖励)                                       │
│    │                                                        │
│    └──< achievement (成就)                                  │
│                                                             │
│  ═══════════════ 独立模板库（无关联）═══════════════        │
│                                                             │
│  habit_library (习惯库) ── 供创建习惯时选择                 │
│                                                             │
│  behavior_recipe_template (配方模板库) ── 供添加微行为配方  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 关系说明

| 关系 | 说明 |
|-----|------|
| user → habit | 一对多：一个用户可以创建多个习惯 |
| habit → micro_behavior | 一对多：一个习惯下可以有多个微行为 |
| micro_behavior → check_in | 一对多：一个微行为可以有多条打卡记录 |
| user → reward | 一对多：一个用户可以创建多个奖励 |
| user → achievement | 一对多：一个用户可以解锁多个成就 |

### 3.2 模板库说明

| 表 | 用途 | 来源 |
|---|------|------|
| habit_library | 习惯库，供创建习惯时选择 | 系统预设 + 用户分享 |
| behavior_recipe_template | 配方模板库，供添加微行为配方 | 系统预设 + 用户分享 |

**说明：** 习惯库和配方模板库是两个独立的模板表，无关联关系。
- 习惯库：对应父级习惯
- 配方模板库：对应子级微行为配方

