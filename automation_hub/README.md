# 자동화 중앙 통제 센터 (Automation Hub)

블로그(네이버, Next.js)와 유튜브 쇼츠 채널 100개를 중앙에서 관리하는 자동화 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11+
- **Database**: Supabase (PostgreSQL)
- **Infrastructure**: VPS (Ubuntu 22.04)
- **Scheduler**: APScheduler

## 프로젝트 구조

```
automation-hub/
├── apps/
│   ├── dashboard/          # Next.js 대시보드 (Vercel 배포)
│   └── api/                # FastAPI 서버 (VPS 배포)
├── supabase/
│   └── migrations/         # 데이터베이스 마이그레이션
├── scripts/                # 배포 및 유틸리티 스크립트
└── docs/                   # 프로젝트 문서
```

## 주요 기능

- **그룹 관리**: 채널들을 그룹으로 묶어서 일괄 관리
- **스케줄링**: Cron 표현식으로 자동 실행 스케줄 설정
- **실시간 모니터링**: 작업 진행 상태 실시간 확인
- **통계 대시보드**: 채널별 성과 지표 시각화
- **수동 실행**: 필요시 즉시 실행 가능

## 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.11+
- Supabase 프로젝트

### 대시보드 실행

```bash
cd apps/dashboard
npm install
npm run dev
```

### API 서버 실행

```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```

### 환경변수 설정

루트 및 각 앱 디렉토리의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

## 문서

- [아키텍처 설명](./docs/architecture.md)
- [API 명세](./docs/api-spec.md)
- [세팅 가이드](./docs/setup-guide.md)

## 라이선스

Private Project
