-- =============================================
-- 인덱스 생성
-- 쿼리 성능 최적화
-- =============================================

-- channels 인덱스
CREATE INDEX IF NOT EXISTS idx_channels_group_id ON channels(group_id);
CREATE INDEX IF NOT EXISTS idx_channels_status ON channels(status);

-- run_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_run_logs_channel_id ON run_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_run_logs_started_at ON run_logs(started_at DESC);

-- stats 인덱스
CREATE INDEX IF NOT EXISTS idx_stats_channel_date ON stats(channel_id, date DESC);

-- schedules 인덱스
CREATE INDEX IF NOT EXISTS idx_schedules_target ON schedules(target_type, target_id);
