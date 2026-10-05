-- ==========================================
-- AgriShield AI - PostgreSQL Schema
-- ==========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS detections CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS community_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------
-- 1. Users Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(20) NOT NULL,
    village VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    farm_name VARCHAR(255),
    farm_size NUMERIC(10, 2),
    primary_crop VARCHAR(255),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 1.1. User Settings Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    language VARCHAR(20) DEFAULT 'en',
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_mode VARCHAR(10) DEFAULT 'all',
    voice_alert_enabled BOOLEAN DEFAULT TRUE,
    voice_language VARCHAR(20) DEFAULT 'en',
    alert_volume INTEGER DEFAULT 100,
    security_system_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 1.2. Device Tokens Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    device_token VARCHAR(512) NOT NULL,
    platform VARCHAR(50),
    device_name VARCHAR(100),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_failure TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 1.3. Notifications Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'PENDING',
    related_detection_id UUID,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------
-- 2. Detections Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_type VARCHAR(100) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL, -- e.g., 0.9523
    risk_level VARCHAR(50) NOT NULL,
    bbox_x NUMERIC(10, 4) NOT NULL,
    bbox_y NUMERIC(10, 4) NOT NULL,
    bbox_w NUMERIC(10, 4) NOT NULL,
    bbox_h NUMERIC(10, 4) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 3. Alerts Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id UUID,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 4. Community Posts Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    animal_type VARCHAR(100),
    distance VARCHAR(50),
    side VARCHAR(50),
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 5. Community Likes Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);
