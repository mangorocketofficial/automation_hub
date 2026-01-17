#!/bin/bash
# =============================================
# API 서버 배포 스크립트
# VPS에서 실행
# =============================================

set -e  # 오류 발생 시 스크립트 중단

# 설정
APP_DIR=~/automation-hub
API_DIR=$APP_DIR/apps/api
VENV_DIR=$APP_DIR/venv
PM2_APP_NAME="automation-hub-api"

echo "=========================================="
echo "API 서버 배포 시작"
echo "=========================================="

# 디렉토리 이동
cd $APP_DIR

# Git 최신 코드 가져오기
echo "[1/5] Git pull..."
git pull origin main

# 가상환경 활성화
echo "[2/5] 가상환경 활성화..."
source $VENV_DIR/bin/activate

# 의존성 설치
echo "[3/5] 의존성 설치..."
cd $API_DIR
pip install -r requirements.txt

# 환경변수 확인
if [ ! -f ".env" ]; then
    echo "경고: .env 파일이 없습니다. .env.example을 참고하여 생성해주세요."
    exit 1
fi

# PM2로 서버 재시작
echo "[4/5] PM2 서버 재시작..."
cd $API_DIR

# PM2 ecosystem 파일 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: '$VENV_DIR/bin/uvicorn',
    args: 'main:app --host 0.0.0.0 --port 8000',
    cwd: '$API_DIR',
    interpreter: 'none',
    env: {
      PATH: '$VENV_DIR/bin:' + process.env.PATH
    }
  }]
};
EOF

# PM2 앱 재시작 (없으면 시작)
pm2 delete $PM2_APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js

# PM2 저장 (서버 재부팅 시 자동 시작)
pm2 save

# 상태 확인
echo "[5/5] 배포 완료, 상태 확인..."
pm2 status

echo "=========================================="
echo "배포 완료!"
echo "=========================================="
echo ""
echo "서버 상태 확인: pm2 status"
echo "로그 확인: pm2 logs $PM2_APP_NAME"
echo "서버 재시작: pm2 restart $PM2_APP_NAME"
echo ""
echo "API 엔드포인트: http://$(hostname -I | awk '{print $1}'):8000"
