-- =============================================
-- 자동화 허브 데이터베이스 테이블 생성
-- Supabase SQL Editor에서 실행
-- =============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. groups (그룹)
-- 채널들을 그룹으로 묶어서 관리
-- =============================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('youtube_shorts', 'naver_blog', 'nextjs_blog')),
    description TEXT,
    schedule_cron TEXT DEFAULT '0 9 * * *',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE groups IS '채널 그룹 테이블 (예: 심리쇼츠, 골프블로그)';
COMMENT ON COLUMN groups.type IS '채널 유형: youtube_shorts, naver_blog, nextjs_blog';
COMMENT ON COLUMN groups.schedule_cron IS 'Cron 표현식 (기본: 매일 9시)';

-- RLS 비활성화
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. channels (채널)
-- 개별 채널 정보
-- =============================================
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('youtube_shorts', 'naver_blog', 'nextjs_blog')),
    config JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    last_run_at TIMESTAMPTZ,
    last_run_status TEXT CHECK (last_run_status IN ('success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE channels IS '개별 채널 테이블';
COMMENT ON COLUMN channels.config IS '채널별 설정 (JSON)';
COMMENT ON COLUMN channels.status IS '채널 상태: active, paused, error';

-- RLS 비활성화
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. schedules (스케줄)
-- 자동 실행 스케줄 관리
-- =============================================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('group', 'channel')),
    target_id UUID NOT NULL,
    cron TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE schedules IS '자동 실행 스케줄 테이블';
COMMENT ON COLUMN schedules.target_type IS '대상 유형: group 또는 channel';
COMMENT ON COLUMN schedules.target_id IS '대상 ID (group_id 또는 channel_id)';
COMMENT ON COLUMN schedules.cron IS 'Cron 표현식';

-- RLS 비활성화
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. run_logs (실행 이력)
-- 각 실행의 상세 로그
-- =============================================
CREATE TABLE IF NOT EXISTS run_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    result JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE run_logs IS '실행 이력 테이블';
COMMENT ON COLUMN run_logs.result IS '생성된 콘텐츠 정보 (JSON)';

-- RLS 비활성화
ALTER TABLE run_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. stats (통계)
-- 채널별 일일 통계 (하루 1회 수집)
-- =============================================
CREATE TABLE IF NOT EXISTS stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    subscribers INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 채널-날짜 유니크 제약
    UNIQUE(channel_id, date)
);

COMMENT ON TABLE stats IS '채널별 일일 통계 테이블';

-- RLS 비활성화
ALTER TABLE stats DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. settings (전역 설정)
-- 시스템 전역 설정 저장
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE settings IS '시스템 전역 설정 테이블';

-- RLS 비활성화
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
