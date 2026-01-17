-- =============================================
-- 트리거 생성
-- updated_at 자동 업데이트
-- =============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- groups 테이블 트리거
DROP TRIGGER IF EXISTS trigger_groups_updated_at ON groups;
CREATE TRIGGER trigger_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- channels 테이블 트리거
DROP TRIGGER IF EXISTS trigger_channels_updated_at ON channels;
CREATE TRIGGER trigger_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- schedules 테이블 트리거
DROP TRIGGER IF EXISTS trigger_schedules_updated_at ON schedules;
CREATE TRIGGER trigger_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- settings 테이블 트리거
DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
