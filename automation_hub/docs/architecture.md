# 시스템 아키텍처

## 개요

자동화 중앙 통제 센터는 블로그와 유튜브 채널을 자동으로 관리하는 시스템입니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (브라우저)                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard (Next.js)                          │
│                    - Vercel 배포                                │
│                    - 실시간 모니터링                              │
│                    - 그룹/채널 관리                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Server (FastAPI)                        │
│                     - VPS 배포                                  │
│                     - APScheduler                               │
│                     - 워커 관리                                  │
├─────────────────────────────┼───────────────────────────────────┤
│  Workers                    │                                   │
│  ├── YouTube Shorts Worker  │  ┌─────────────────────────────┐  │
│  ├── Naver Blog Worker      │  │    Supabase (PostgreSQL)    │  │
│  └── Next.js Blog Worker    │  │    - 그룹/채널 데이터         │  │
│                             │  │    - 실행 로그               │  │
│                             │  │    - 통계 데이터             │  │
└─────────────────────────────┴──┴─────────────────────────────┴──┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  ├── YouTube Data API                                          │
│  ├── Naver Blog API                                            │
│  ├── OpenAI API                                                │
│  └── Git Repository (Next.js 블로그)                            │
└─────────────────────────────────────────────────────────────────┘
```

## 컴포넌트 상세

### 1. Dashboard (Next.js)

**역할**: 사용자 인터페이스 제공

**기술 스택**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Client

**주요 기능**:
- 실행 현황 대시보드
- 그룹/채널 CRUD
- 통계 시각화
- 수동 실행 제어

**배포**: Vercel (자동 배포)

### 2. API Server (FastAPI)

**역할**: 비즈니스 로직 및 자동화 실행

**기술 스택**:
- FastAPI
- APScheduler
- Supabase Python Client
- Python 3.11+

**주요 기능**:
- REST API 제공
- 스케줄 관리
- 워커 실행 제어
- 로깅 및 모니터링

**배포**: VPS (PM2)

### 3. Workers

**역할**: 실제 자동화 작업 수행

**유형**:
- **YouTube Shorts Worker**: 영상 생성 및 업로드
- **Naver Blog Worker**: 블로그 글 작성 및 포스팅
- **Next.js Blog Worker**: MDX 파일 생성 및 Git 푸시

### 4. Supabase

**역할**: 데이터 저장 및 관리

**테이블**:
- `groups`: 그룹 정보
- `channels`: 채널 정보
- `run_logs`: 실행 기록
- `channel_stats`: 채널 통계
- `settings`: 시스템 설정

## 데이터 흐름

### 스케줄 실행 흐름

```
1. APScheduler가 Cron 시간에 트리거
2. Executor가 그룹 내 채널 조회
3. 각 채널에 맞는 Worker 생성
4. Worker가 자동화 작업 수행
5. 결과를 run_logs에 기록
6. 채널 상태 업데이트
```

### 수동 실행 흐름

```
1. Dashboard에서 실행 버튼 클릭
2. API Server로 POST 요청
3. BackgroundTask로 Worker 실행
4. 결과를 DB에 기록
5. Dashboard에서 상태 폴링
```

## 기술 스택 선정 이유

### Next.js (Dashboard)
- **App Router**: 최신 React 패턴 지원
- **서버 컴포넌트**: 초기 로딩 성능 향상
- **Vercel 통합**: 간편한 배포

### FastAPI (API Server)
- **비동기 지원**: 높은 동시성 처리
- **타입 힌트**: Pydantic을 통한 자동 검증
- **자동 문서화**: OpenAPI (Swagger) 지원

### Supabase (Database)
- **PostgreSQL**: 안정적인 RDBMS
- **실시간 구독**: 향후 실시간 업데이트 가능
- **Row Level Security**: 보안 정책 관리

### APScheduler (Scheduler)
- **Cron 지원**: 유연한 스케줄 표현
- **AsyncIO 통합**: FastAPI와 자연스러운 통합
- **Job Store**: DB 기반 Job 관리 가능

## 확장성 고려사항

1. **워커 스케일링**: 여러 VPS에 워커 분산 가능
2. **큐 시스템**: Redis/RabbitMQ 도입 가능
3. **캐싱**: Redis 캐시 레이어 추가 가능
4. **모니터링**: Prometheus/Grafana 연동 가능
