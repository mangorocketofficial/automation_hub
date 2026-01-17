-- =============================================
-- 플랫폼 테이블 추가 및 그룹 연결
--
-- 변경 사항:
-- 1. platforms 테이블 생성 (플랫폼 마스터 데이터)
-- 2. groups.platform_id 컬럼 추가 (FK)
-- 3. 기존 groups.type 데이터를 platform_id로 마이그레이션
--
-- 데이터 계층 구조:
--   platforms → groups → channels
--   (플랫폼)    (그룹)    (채널)
-- =============================================

-- =============================================
-- 1. platforms 테이블 생성
-- 플랫폼 마스터 데이터 관리
-- =============================================
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- key 값 제약: 허용된 플랫폼 키만 사용 가능
    CONSTRAINT platforms_key_check CHECK (
        key IN ('youtube_shorts', 'nextjs_blog', 'naver_blog', 'instagram')
    )
);

COMMENT ON TABLE platforms IS '플랫폼 마스터 테이블 - 지원하는 콘텐츠 플랫폼 정의';
COMMENT ON COLUMN platforms.key IS '플랫폼 식별 키 (유니크): youtube_shorts, nextjs_blog, naver_blog, instagram';
COMMENT ON COLUMN platforms.name IS '플랫폼 표시명 (예: YouTube Shorts, 네이버 블로그)';
COMMENT ON COLUMN platforms.config IS '플랫폼 공통 설정 (JSON) - API 키, 기본 옵션 등';

-- RLS 비활성화 (기존 테이블과 동일 정책)
ALTER TABLE platforms DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 초기 플랫폼 데이터 삽입
-- 이미 존재하는 경우 무시 (ON CONFLICT DO NOTHING)
-- =============================================
INSERT INTO platforms (key, name, description, config, is_active) VALUES
    (
        'youtube_shorts',
        'YouTube Shorts',
        'YouTube 쇼츠 영상 자동 생성 및 업로드',
        '{"max_duration_seconds": 60, "default_language": "ko"}',
        TRUE
    ),
    (
        'nextjs_blog',
        'Next.js Blog',
        'Next.js 기반 블로그 포스트 자동 생성',
        '{"default_format": "mdx", "auto_seo": true}',
        TRUE
    ),
    (
        'naver_blog',
        'Naver Blog',
        '네이버 블로그 포스트 자동 작성 및 발행',
        '{"auto_hashtag": true, "default_category": "일상"}',
        TRUE
    ),
    (
        'instagram',
        'Instagram',
        'Instagram 피드/릴스 콘텐츠 자동 생성',
        '{"content_types": ["feed", "reels", "story"], "default_language": "ko"}',
        TRUE
    )
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 3. groups 테이블에 platform_id 컬럼 추가
-- 단계별 안전한 마이그레이션:
--   Step 1: nullable 컬럼으로 추가
--   Step 2: 기존 데이터 마이그레이션
--   Step 3: NOT NULL 제약 및 FK 설정
-- =============================================

-- Step 1: platform_id 컬럼 추가 (nullable)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'groups' AND column_name = 'platform_id'
    ) THEN
        ALTER TABLE groups ADD COLUMN platform_id UUID;
    END IF;
END $$;

COMMENT ON COLUMN groups.platform_id IS '플랫폼 ID (FK → platforms.id)';

-- Step 2: 기존 groups.type 값을 기반으로 platform_id 업데이트
-- type과 platforms.key를 매핑하여 platform_id 할당
UPDATE groups g
SET platform_id = p.id
FROM platforms p
WHERE g.type = p.key
  AND g.platform_id IS NULL;

-- Step 3: platform_id NOT NULL 제약 추가
-- (모든 기존 데이터에 platform_id가 채워진 후 실행)
DO $$
BEGIN
    -- platform_id가 NULL인 레코드가 없는지 확인
    IF NOT EXISTS (SELECT 1 FROM groups WHERE platform_id IS NULL) THEN
        -- NOT NULL 제약이 없으면 추가
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'groups'
              AND column_name = 'platform_id'
              AND is_nullable = 'YES'
        ) THEN
            ALTER TABLE groups ALTER COLUMN platform_id SET NOT NULL;
        END IF;
    ELSE
        RAISE NOTICE 'Warning: Some groups have NULL platform_id. NOT NULL constraint not applied.';
    END IF;
END $$;

-- Step 4: Foreign Key 제약 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'groups_platform_id_fkey'
          AND table_name = 'groups'
    ) THEN
        ALTER TABLE groups
        ADD CONSTRAINT groups_platform_id_fkey
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- =============================================
-- 4. 인덱스 추가
-- =============================================
CREATE INDEX IF NOT EXISTS idx_groups_platform_id ON groups(platform_id);
CREATE INDEX IF NOT EXISTS idx_platforms_key ON platforms(key);
CREATE INDEX IF NOT EXISTS idx_platforms_is_active ON platforms(is_active);

-- =============================================
-- 5. updated_at 트리거 적용 (platforms 테이블)
-- =============================================
DO $$
BEGIN
    -- 트리거가 없으면 생성
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_platforms_updated_at'
    ) THEN
        CREATE TRIGGER update_platforms_updated_at
            BEFORE UPDATE ON platforms
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 6. groups.type 컬럼 관련 주석 (deprecated 예정)
-- =============================================
COMMENT ON COLUMN groups.type IS '[DEPRECATED] 채널 유형 - platform_id 사용 권장.
기존 호환성을 위해 당분간 유지하지만, 향후 제거 예정.
platforms 테이블의 key와 동일한 값을 가짐.';

COMMENT ON COLUMN channels.type IS '[DEPRECATED] 채널 유형 - 그룹의 platform을 따름.
channels.type은 소속 그룹(group_id)의 platform에 의해 결정됨.
향후 이 컬럼은 제거되고 groups.platform_id를 통해 간접 참조할 예정.';

-- =============================================
-- 마이그레이션 완료 확인 쿼리 (수동 검증용)
-- =============================================
-- SELECT
--     g.id, g.name, g.type, g.platform_id,
--     p.key as platform_key, p.name as platform_name
-- FROM groups g
-- LEFT JOIN platforms p ON g.platform_id = p.id;
