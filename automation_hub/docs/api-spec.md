# API 명세서

## Base URL

```
Production: https://your-vps-ip:8000
Development: http://localhost:8000
```

## 인증

현재 버전에서는 인증이 구현되지 않았습니다. 프로덕션 배포 전 JWT 인증을 추가하세요.

---

## 그룹 API

### 그룹 목록 조회

```http
GET /api/groups
```

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "유튜브 쇼츠 그룹 A",
    "type": "youtube_shorts",
    "description": "테크 관련 유튜브 쇼츠",
    "schedule_cron": "0 9 * * *",
    "is_active": true,
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
]
```

### 그룹 상세 조회

```http
GET /api/groups/{group_id}
```

**Response** `200 OK`
```json
{
  "id": "uuid",
  "name": "유튜브 쇼츠 그룹 A",
  "type": "youtube_shorts",
  "description": "테크 관련 유튜브 쇼츠",
  "schedule_cron": "0 9 * * *",
  "is_active": true,
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

### 그룹 생성

```http
POST /api/groups
```

**Request Body**
```json
{
  "name": "새 그룹",
  "type": "youtube_shorts",
  "description": "그룹 설명",
  "schedule_cron": "0 10 * * *",
  "is_active": true
}
```

**Response** `201 Created`

### 그룹 수정

```http
PUT /api/groups/{group_id}
```

**Request Body**
```json
{
  "name": "수정된 그룹명",
  "is_active": false
}
```

**Response** `200 OK`

### 그룹 삭제

```http
DELETE /api/groups/{group_id}
```

**Response** `204 No Content`

---

## 채널 API

### 채널 목록 조회

```http
GET /api/channels
GET /api/channels?group_id={group_id}
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| group_id | string | 그룹 ID 필터 (선택) |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "group_id": "uuid",
    "name": "테크 뉴스 채널",
    "type": "youtube_shorts",
    "config": {
      "youtube_channel_id": "UCxxxxxxxx",
      "content_topic": "tech_news"
    },
    "status": "active",
    "last_run_at": "2024-01-15T09:00:00Z",
    "last_run_status": "success",
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
]
```

### 채널 생성

```http
POST /api/channels
```

**Request Body**
```json
{
  "group_id": "uuid",
  "name": "새 채널",
  "type": "youtube_shorts",
  "config": {
    "youtube_channel_id": "UCxxxxxxxx",
    "content_topic": "tech_news"
  }
}
```

**Response** `201 Created`

### 채널 수정

```http
PUT /api/channels/{channel_id}
```

**Request Body**
```json
{
  "name": "수정된 채널명",
  "status": "paused",
  "config": {
    "content_topic": "ai_trends"
  }
}
```

**Response** `200 OK`

### 채널 삭제

```http
DELETE /api/channels/{channel_id}
```

**Response** `204 No Content`

---

## 실행 API

### 전체 실행

```http
POST /api/run/all
```

모든 활성 그룹의 채널들을 실행합니다.

**Response** `200 OK`
```json
{
  "message": "5개 그룹의 작업이 시작되었습니다"
}
```

### 그룹 실행

```http
POST /api/run/group/{group_id}
```

특정 그룹의 모든 활성 채널을 실행합니다.

**Response** `200 OK`
```json
{
  "message": "그룹 '유튜브 쇼츠 그룹 A'의 10개 채널 작업이 시작되었습니다"
}
```

### 채널 실행

```http
POST /api/run/channel/{channel_id}
```

특정 채널만 실행합니다.

**Response** `200 OK`
```json
{
  "message": "채널 '테크 뉴스 채널' 작업이 시작되었습니다"
}
```

### 전체 중지

```http
POST /api/stop/all
```

실행 중인 모든 작업에 중지 요청을 보냅니다.

**Response** `200 OK`
```json
{
  "message": "3개 작업이 중지되었습니다"
}
```

---

## 스케줄 API

### 스케줄 목록 조회

```http
GET /api/schedules
```

**Response** `200 OK`
```json
[
  {
    "job_id": "group_uuid",
    "group_id": "uuid",
    "group_name": "유튜브 쇼츠 그룹 A",
    "cron_expression": "0 9 * * *",
    "next_run_time": "2024-01-16T09:00:00+09:00",
    "is_paused": false
  }
]
```

### 스케줄 동기화

```http
POST /api/schedules/sync
```

데이터베이스의 그룹 정보와 스케줄러를 동기화합니다.

**Response** `200 OK`
```json
{
  "message": "스케줄 동기화 완료",
  "total_groups": 5,
  "registered_schedules": 4
}
```

### 스케줄 일시정지

```http
POST /api/schedules/{group_id}/pause
```

**Response** `200 OK`
```json
{
  "message": "그룹 '유튜브 쇼츠 그룹 A' 스케줄이 일시정지되었습니다"
}
```

### 스케줄 재개

```http
POST /api/schedules/{group_id}/resume
```

**Response** `200 OK`
```json
{
  "message": "그룹 '유튜브 쇼츠 그룹 A' 스케줄이 재개되었습니다"
}
```

---

## 통계 API

### 대시보드 요약

```http
GET /api/stats/summary
```

오늘의 실행 현황 요약을 반환합니다.

**Response** `200 OK`
```json
{
  "scheduled": 10,
  "running": 2,
  "completed": 15,
  "failed": 1
}
```

### 실행 로그 조회

```http
GET /api/stats/logs
GET /api/stats/logs?channel_id={channel_id}&limit=50
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| channel_id | string | 채널 ID 필터 (선택) |
| limit | integer | 조회 개수 (기본: 50, 최대: 500) |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "channel_id": "uuid",
    "group_id": "uuid",
    "status": "success",
    "started_at": "2024-01-15T09:00:00Z",
    "finished_at": "2024-01-15T09:00:45Z",
    "duration_seconds": 45,
    "result": {
      "video_id": "abc123",
      "title": "테스트 영상"
    },
    "error_message": null
  }
]
```

### 채널 통계 조회

```http
GET /api/stats/channel/{channel_id}
GET /api/stats/channel/{channel_id}?days=30
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| days | integer | 조회 기간 (기본: 30, 최대: 365) |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "channel_id": "uuid",
    "date": "2024-01-15",
    "views": 1500,
    "subscribers": 120,
    "likes": 85,
    "comments": 12,
    "posts_count": 1
  }
]
```

### 전체 개요 통계

```http
GET /api/stats/overview
```

**Response** `200 OK`
```json
{
  "total_channels": 50,
  "channel_status": {
    "active": 45,
    "paused": 3,
    "error": 2
  },
  "weekly_stats": {
    "total_runs": 150,
    "successful_runs": 142,
    "failed_runs": 8,
    "success_rate": 94.7
  }
}
```

---

## 에러 응답

모든 API는 다음 형식의 에러 응답을 반환합니다:

```json
{
  "detail": "에러 메시지"
}
```

**HTTP 상태 코드**
| Code | Description |
|------|-------------|
| 400 | Bad Request - 잘못된 요청 |
| 404 | Not Found - 리소스를 찾을 수 없음 |
| 500 | Internal Server Error - 서버 오류 |
