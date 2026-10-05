-- ==========================================
-- AgriShield AI - PostgreSQL Constraints
-- ==========================================

-- 1. Users Constraints
ALTER TABLE users
ADD CONSTRAINT uq_users_email UNIQUE (email),
ADD CONSTRAINT uq_users_phone UNIQUE (phone);

-- 1.1 User Settings Constraints
ALTER TABLE user_settings
ADD CONSTRAINT fk_user_settings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT uq_user_settings_user_id UNIQUE (user_id);

-- 1.2 Device Tokens Constraints
ALTER TABLE device_tokens
ADD CONSTRAINT fk_device_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT uq_device_tokens_token UNIQUE (device_token);

-- 1.3 Notifications Constraints
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_notifications_detection_id FOREIGN KEY (related_detection_id) REFERENCES detections(id) ON DELETE SET NULL;

-- 2. Detections Constraints
ALTER TABLE detections
ADD CONSTRAINT chk_detections_confidence CHECK (confidence >= 0 AND confidence <= 1);

-- 3. Alerts Constraints
ALTER TABLE alerts
ADD CONSTRAINT fk_alerts_detection_id FOREIGN KEY (detection_id) REFERENCES detections(id) ON DELETE SET NULL;

-- 4. Community Posts Constraints
ALTER TABLE community_posts
ADD CONSTRAINT fk_community_posts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Community Likes Constraints
ALTER TABLE community_likes
ADD CONSTRAINT fk_community_likes_post_id FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_community_likes_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
