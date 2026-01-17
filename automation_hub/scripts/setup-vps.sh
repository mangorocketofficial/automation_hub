#!/bin/bash
# =============================================
# VPS 초기 세팅 스크립트
# Ubuntu 22.04 기준
# =============================================

set -e  # 오류 발생 시 스크립트 중단

echo "=========================================="
echo "VPS 초기 세팅 시작"
echo "=========================================="

# 시스템 업데이트
echo "[1/7] 시스템 업데이트..."
sudo apt update && sudo apt upgrade -y

# 기본 패키지 설치
echo "[2/7] 기본 패키지 설치..."
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    unzip \
    software-properties-common

# Python 3.11 설치
echo "[3/7] Python 3.11 설치..."
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Python 3.11을 기본으로 설정
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# FFmpeg 설치 (영상 처리용)
echo "[4/7] FFmpeg 설치..."
sudo apt install -y ffmpeg

# Node.js 설치 (pm2 사용을 위해)
echo "[5/7] Node.js 설치..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 설치 (프로세스 매니저)
echo "[6/7] PM2 설치..."
sudo npm install -g pm2

# 프로젝트 디렉토리 생성
echo "[7/7] 프로젝트 디렉토리 생성..."
mkdir -p ~/automation-hub
cd ~/automation-hub

# Python 가상환경 생성
python3 -m venv venv
source venv/bin/activate

echo "=========================================="
echo "VPS 초기 세팅 완료!"
echo "=========================================="
echo ""
echo "설치된 버전:"
echo "  - Python: $(python3 --version)"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - FFmpeg: $(ffmpeg -version 2>&1 | head -n1)"
echo "  - PM2: $(pm2 --version)"
echo ""
echo "다음 단계:"
echo "  1. 프로젝트 코드를 ~/automation-hub에 배포"
echo "  2. .env 파일 설정"
echo "  3. deploy.sh 실행"
