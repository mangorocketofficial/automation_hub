-- =============================================
-- 테스트용 샘플 데이터
-- =============================================

-- =============================================
-- 그룹 2개 생성
-- =============================================
INSERT INTO groups (id, name, type, description, schedule_cron, is_active) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '심리쇼츠',
    'youtube_shorts',
    '심리학 관련 유튜브 쇼츠 채널 그룹',
    '0 9 * * *',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    '골프블로그',
    'naver_blog',
    '골프 관련 네이버 블로그 그룹',
    '0 10 * * *',
    true
);

-- =============================================
-- 채널 3개 생성
-- =============================================
INSERT INTO channels (id, group_id, name, type, config, status) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '심리CH1',
    'youtube_shorts',
    '{"youtube_channel_id": "UCpsycho01", "content_topic": "심리학_기초", "language": "ko"}',
    'active'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '심리CH2',
    'youtube_shorts',
    '{"youtube_channel_id": "UCpsycho02", "content_topic": "연애심리", "language": "ko"}',
    'active'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    '골프블로그1',
    'naver_blog',
    '{"blog_id": "golfblog01", "content_category": "골프_레슨", "auto_hashtag": true}',
    'active'
);

-- =============================================
-- 스케줄 1개 생성
-- =============================================
INSERT INTO schedules (id, target_type, target_id, cron, is_active) VALUES
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'group',
    '11111111-1111-1111-1111-111111111111',
    '0 9 * * *',
    true
);

-- =============================================
-- 기본 설정 데이터
-- =============================================
INSERT INTO settings (key, value) VALUES
('openai_model', '"gpt-4o"'),
('default_language', '"ko"'),
('notification_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
