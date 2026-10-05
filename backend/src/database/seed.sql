-- Seed Users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone)
VALUES 
('50446c8f-1ab1-4bcf-b4bf-f3558d70c3ba', 'demo@agrishield.in', '$2b$10$04IwDMkRrOe24rF8wU8.yez9FpyT4HzDn4vjpGs6rO.DqfAJSBO9S', 'Demo', 'Farmer', 'admin', '9825041122'),
('00000000-0000-0000-0000-000000000001', 'farmer.john@agrishield.in', '$2b$10$04IwDMkRrOe24rF8wU8.yez9FpyT4HzDn4vjpGs6rO.DqfAJSBO9S', 'Farmer', 'John', 'user', '9876543210'),
('00000000-0000-0000-0000-000000000002', 'admin@agritech.in', '$2b$10$04IwDMkRrOe24rF8wU8.yez9FpyT4HzDn4vjpGs6rO.DqfAJSBO9S', 'AgriTech', 'Admin', 'user', '9123456789')
ON CONFLICT (id) DO NOTHING;

-- Seed Detections
INSERT INTO detections (id, animal_type, confidence, risk_level, bbox_x, bbox_y, bbox_w, bbox_h, created_at)
VALUES 
(uuid_generate_v4(), 'BOAR', 0.92, 'HIGH', 10.5, 20.2, 100.0, 150.0, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(uuid_generate_v4(), 'DEER', 0.85, 'MEDIUM', 50.5, 40.2, 80.0, 120.0, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(uuid_generate_v4(), 'ELEPHANT', 0.99, 'CRITICAL', 110.5, 220.2, 300.0, 350.0, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(uuid_generate_v4(), 'BOAR', 0.78, 'MEDIUM', 15.5, 25.2, 90.0, 140.0, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(uuid_generate_v4(), 'MONKEY', 0.65, 'LOW', 210.5, 120.2, 40.0, 50.0, CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Seed Alerts
INSERT INTO alerts (id, message, severity, created_at)
VALUES 
(uuid_generate_v4(), 'High risk detection: BOAR detected with 92% confidence', 'Critical', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(uuid_generate_v4(), 'Critical risk detection: ELEPHANT detected with 99% confidence', 'Critical', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(uuid_generate_v4(), 'System Maintenance Completed', 'Info', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- ------------------------------------------
-- 5. Seed Community Posts
-- ------------------------------------------
INSERT INTO community_posts (id, user_id, content, animal_type, distance, side, likes_count, created_at)
VALUES 
    ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000001', 'Wild boars spotted near the north fence. Check your perimeters.', 'Wild Boar', '200m', 'North Fence', 12, NOW() - INTERVAL '2 hours'),
    ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000002', 'System update scheduled for tonight. Expect 5 mins downtime.', NULL, NULL, NULL, 45, NOW() - INTERVAL '5 hours'),
    ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-000000000002', 'Nilgai herd moving east. They avoided our deterrents.', 'Nilgai', '500m', 'East Gate', 3, NOW() - INTERVAL '1 day');

-- ------------------------------------------
-- 6. Seed Community Likes
-- ------------------------------------------
INSERT INTO community_likes (post_id, user_id)
VALUES 
    ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000001');
