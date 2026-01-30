-- 创建数据库
CREATE DATABASE IF NOT EXISTS tiny_habits DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tiny_habits;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
  `level` INT UNSIGNED DEFAULT 1,
  `total_points` INT UNSIGNED DEFAULT 0,
  `available_points` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 习惯表（父习惯）
CREATE TABLE IF NOT EXISTS `habit` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT '习惯名称',
  `icon` VARCHAR(10) DEFAULT NULL COMMENT '习惯图标',
  `category` VARCHAR(50) NOT NULL DEFAULT '生活' COMMENT '分类',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '习惯描述',
  `micro_behavior_ids` JSON DEFAULT NULL COMMENT '关联的微行为ID数组',
  `micro_behavior_count` INT UNSIGNED DEFAULT 0 COMMENT '微行为数量',
  `source_library_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '来源习惯库ID',
  `is_active` TINYINT(1) DEFAULT 1,
  `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开到习惯库',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 微行为表（子行为）
CREATE TABLE IF NOT EXISTS `micro_behavior` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `habit_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联的父习惯ID（可选）',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `source_template_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '来源模板ID（从配方库添加时记录）',
  `name` VARCHAR(100) NOT NULL COMMENT '微行为名称',
  `icon` VARCHAR(10) DEFAULT NULL,
  `anchor` VARCHAR(200) NOT NULL COMMENT '锚点行为',
  `behavior` VARCHAR(200) NOT NULL COMMENT '微行为内容',
  `celebration` VARCHAR(100) NOT NULL COMMENT '庆祝方式',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `frequency` JSON NOT NULL COMMENT '频率设置',
  `reminder_enabled` TINYINT(1) DEFAULT 0,
  `reminder_time` TIME DEFAULT NULL,
  `sort_order` INT UNSIGNED DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_habit_id` (`habit_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_source_template_id` (`source_template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 打卡记录表
CREATE TABLE IF NOT EXISTS `check_in` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `micro_behavior_id` BIGINT UNSIGNED NOT NULL,
  `habit_id` BIGINT UNSIGNED NOT NULL,
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

-- 奖励表
CREATE TABLE IF NOT EXISTS `reward` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) NOT NULL,
  `cost` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'redeemed') DEFAULT 'pending',
  `redeemed_at` TIMESTAMP DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 成就表
CREATE TABLE IF NOT EXISTS `achievement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 习惯库表
CREATE TABLE IF NOT EXISTS `habit_library` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_habit_id` BIGINT UNSIGNED DEFAULT NULL,
  `source_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) DEFAULT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `suggested_anchors` JSON NOT NULL,
  `suggested_behaviors` JSON NOT NULL,
  `suggested_celebrations` JSON DEFAULT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `is_system` TINYINT(1) DEFAULT 0,
  `popularity` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 微行为配方模板表
CREATE TABLE IF NOT EXISTS `behavior_recipe_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_micro_behavior_id` BIGINT UNSIGNED DEFAULT NULL,
  `source_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) DEFAULT NULL,
  `anchor` VARCHAR(200) NOT NULL,
  `behavior` VARCHAR(200) NOT NULL,
  `celebration` VARCHAR(100) NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `is_system` TINYINT(1) DEFAULT 0,
  `popularity` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
