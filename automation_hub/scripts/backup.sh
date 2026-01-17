#!/bin/bash
# =============================================
# 데이터베이스 백업 스크립트
# Supabase 데이터 백업
# =============================================

set -e  # 오류 발생 시 스크립트 중단

# 설정
BACKUP_DIR=~/backups/automation-hub
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.json"

# Supabase 설정 (환경변수에서 가져오기)
SUPABASE_URL=${SUPABASE_URL:-""}
SUPABASE_KEY=${SUPABASE_SERVICE_KEY:-""}

echo "=========================================="
echo "데이터베이스 백업 시작"
echo "=========================================="

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 환경변수 확인
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "오류: SUPABASE_URL 또는 SUPABASE_SERVICE_KEY가 설정되지 않았습니다."
    echo "환경변수를 설정하거나 스크립트를 수정해주세요."
    exit 1
fi

echo "[1/4] 그룹 데이터 백업..."
curl -s "$SUPABASE_URL/rest/v1/groups?select=*" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    > "$BACKUP_DIR/groups_$DATE.json"

echo "[2/4] 채널 데이터 백업..."
curl -s "$SUPABASE_URL/rest/v1/channels?select=*" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    > "$BACKUP_DIR/channels_$DATE.json"

echo "[3/4] 설정 데이터 백업..."
curl -s "$SUPABASE_URL/rest/v1/settings?select=*" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    > "$BACKUP_DIR/settings_$DATE.json"

echo "[4/4] 최근 실행 로그 백업 (최근 1000건)..."
curl -s "$SUPABASE_URL/rest/v1/run_logs?select=*&order=started_at.desc&limit=1000" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    > "$BACKUP_DIR/run_logs_$DATE.json"

# 백업 파일 압축
echo "백업 파일 압축..."
cd $BACKUP_DIR
tar -czf "backup_$DATE.tar.gz" \
    "groups_$DATE.json" \
    "channels_$DATE.json" \
    "settings_$DATE.json" \
    "run_logs_$DATE.json"

# 개별 JSON 파일 삭제
rm -f "groups_$DATE.json" "channels_$DATE.json" "settings_$DATE.json" "run_logs_$DATE.json"

# 오래된 백업 삭제 (7일 이상)
echo "오래된 백업 정리 (7일 이상)..."
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "=========================================="
echo "백업 완료!"
echo "=========================================="
echo ""
echo "백업 파일: $BACKUP_DIR/backup_$DATE.tar.gz"
echo "백업 크기: $(du -h $BACKUP_DIR/backup_$DATE.tar.gz | cut -f1)"
echo ""
echo "백업 목록:"
ls -lh $BACKUP_DIR/*.tar.gz
