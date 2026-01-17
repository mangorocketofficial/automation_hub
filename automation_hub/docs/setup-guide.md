# 세팅 가이드

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [Supabase 설정](#supabase-설정)
3. [Dashboard 설정](#dashboard-설정)
4. [API Server 설정](#api-server-설정)
5. [VPS 배포](#vps-배포)
6. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

### 로컬 개발 환경

- Node.js 18+
- Python 3.11+
- Git

### 서비스 계정

- [Supabase](https://supabase.com) 프로젝트
- [OpenAI](https://platform.openai.com) API 키
- [YouTube Data API](https://console.cloud.google.com) 키 (유튜브 쇼츠 사용 시)
- 네이버 개발자 계정 (네이버 블로그 사용 시)

---

## Supabase 설정

### 1. 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호, 리전 설정
4. 프로젝트 생성 완료까지 대기

### 2. 데이터베이스 초기화

1. Supabase 대시보드에서 "SQL Editor" 접속
2. `supabase/migrations/` 폴더의 SQL 파일을 순서대로 실행:
   - `001_create_tables.sql`
   - `002_create_indexes.sql`
   - `003_create_triggers.sql`
   - `004_sample_data.sql` (선택)

### 3. API 키 확인

1. "Settings" > "API" 이동
2. 다음 값들을 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: 대시보드용
   - **service_role key**: API 서버용 (비밀!)

---

## Dashboard 설정

### 1. 의존성 설치

```bash
cd apps/dashboard
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 수정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
NEXT_PUBLIC_VPS_API_URL=http://localhost:8000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 4. Vercel 배포 (선택)

```bash
npm install -g vercel
vercel
```

환경변수를 Vercel 대시보드에서 설정해야 합니다.

---

## API Server 설정

### 1. 가상환경 생성

```bash
cd apps/api
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
DEBUG=true
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-key
CORS_ORIGINS=http://localhost:3000
OPENAI_API_KEY=sk-your-api-key
YOUTUBE_API_KEY=your-youtube-api-key
LOG_LEVEL=INFO
```

### 4. 개발 서버 실행

```bash
uvicorn main:app --reload
```

API 문서: `http://localhost:8000/docs`

---

## VPS 배포

### 1. VPS 준비

Ubuntu 22.04 LTS 기반 VPS를 준비합니다.
(AWS EC2, DigitalOcean, Vultr 등)

### 2. 초기 세팅

```bash
# VPS에 SSH 접속 후
wget https://raw.githubusercontent.com/your-repo/automation-hub/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 3. 코드 배포

```bash
cd ~
git clone https://github.com/your-repo/automation-hub.git
cd automation-hub
```

### 4. 환경변수 설정

```bash
cd apps/api
cp .env.example .env
nano .env  # 실제 값으로 수정
```

### 5. 배포 실행

```bash
cd ~/automation-hub
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 6. 방화벽 설정

```bash
sudo ufw allow 8000
sudo ufw enable
```

### 7. 상태 확인

```bash
pm2 status
pm2 logs automation-hub-api
```

---

## 트러블슈팅

### Dashboard가 API에 연결되지 않음

1. CORS 설정 확인:
   ```env
   CORS_ORIGINS=http://localhost:3000,https://your-dashboard.vercel.app
   ```

2. API 서버 실행 상태 확인:
   ```bash
   curl http://localhost:8000/health
   ```

### Supabase 연결 오류

1. URL과 키가 올바른지 확인
2. 테이블이 생성되었는지 확인:
   ```sql
   SELECT * FROM groups LIMIT 1;
   ```

### 스케줄러가 작동하지 않음

1. 스케줄 동기화:
   ```bash
   curl -X POST http://localhost:8000/api/schedules/sync
   ```

2. 스케줄 목록 확인:
   ```bash
   curl http://localhost:8000/api/schedules
   ```

### PM2 서버가 재시작 후 실행되지 않음

```bash
pm2 startup
pm2 save
```

### 메모리 부족

PM2 메모리 제한 설정:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    // ...
    max_memory_restart: '500M'
  }]
};
```

---

## 다음 단계

1. **워커 구현**: `apps/api/workers/` 디렉토리의 TODO 항목 구현
2. **인증 추가**: JWT 또는 API 키 인증 추가
3. **모니터링**: Prometheus/Grafana 연동
4. **알림**: Slack/Discord 웹훅 연동
5. **백업 자동화**: crontab에 backup.sh 등록
