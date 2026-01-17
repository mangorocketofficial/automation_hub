"""
Pydantic 모델 정의
API 요청/응답 스키마

데이터 계층 구조:
  platforms → groups → channels
  (플랫폼)    (그룹)    (채널)

- Platform: 콘텐츠 플랫폼 정의 (YouTube Shorts, Naver Blog 등)
- Group: 플랫폼별 채널 그룹 (심리쇼츠, 골프블로그 등)
- Channel: 개별 채널 (그룹에 종속, 플랫폼은 그룹을 통해 간접 참조)
"""

from datetime import datetime
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


# ============ 타입 정의 ============

# 플랫폼 키 타입 (platforms.key와 동일)
PlatformKey = Literal["youtube_shorts", "naver_blog", "nextjs_blog", "instagram"]

# [DEPRECATED] ChannelType - platform_id 사용 권장
# 기존 호환성을 위해 유지. 향후 PlatformKey로 통합 예정.
ChannelType = Literal["youtube_shorts", "naver_blog", "nextjs_blog"]

ChannelStatus = Literal["active", "paused", "error"]
RunStatus = Literal["running", "success", "failed"]
TargetType = Literal["group", "channel"]


# ============ 플랫폼 스키마 ============


class PlatformBase(BaseModel):
    """플랫폼 기본 스키마"""

    key: PlatformKey = Field(..., description="플랫폼 식별 키")
    name: str = Field(..., min_length=1, max_length=100, description="플랫폼 표시명")
    description: Optional[str] = Field(None, max_length=500, description="플랫폼 설명")
    config: Dict[str, Any] = Field(default_factory=dict, description="플랫폼 공통 설정")
    is_active: bool = Field(True, description="활성화 여부")


class PlatformCreate(PlatformBase):
    """플랫폼 생성 스키마"""

    pass


class PlatformUpdate(BaseModel):
    """플랫폼 수정 스키마"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class Platform(PlatformBase):
    """플랫폼 응답 스키마"""

    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ 그룹 스키마 ============


class GroupBase(BaseModel):
    """
    그룹 기본 스키마

    그룹은 특정 플랫폼에 속하며, 여러 채널을 포함합니다.
    플랫폼 정보는 platform_id를 통해 참조합니다.
    """

    name: str = Field(..., min_length=1, max_length=100, description="그룹명")
    platform_id: str = Field(..., description="플랫폼 ID (FK → platforms.id)")

    # [DEPRECATED] type 필드 - platform_id 사용 권장
    # 기존 클라이언트 호환성을 위해 optional로 유지
    # 새 클라이언트는 platform_id만 사용할 것
    type: Optional[ChannelType] = Field(
        None,
        description="[DEPRECATED] 채널 유형 - platform_id 사용 권장. "
        "기존 호환성을 위해 유지되지만, 향후 제거 예정.",
    )

    description: Optional[str] = Field(None, max_length=500, description="그룹 설명")
    schedule_cron: str = Field(default="0 9 * * *", description="스케줄 Cron 표현식")
    is_active: bool = Field(True, description="활성화 여부")


class GroupCreate(BaseModel):
    """
    그룹 생성 스키마

    새 그룹 생성 시 platform_id 필수.
    type은 하위 호환성을 위해 optional로 유지.
    """

    name: str = Field(..., min_length=1, max_length=100, description="그룹명")
    platform_id: Optional[str] = Field(
        None,
        description="플랫폼 ID (FK → platforms.id). 신규 생성 시 권장.",
    )

    # [DEPRECATED] type 필드 - platform_id 사용 권장
    type: Optional[ChannelType] = Field(
        None,
        description="[DEPRECATED] 채널 유형. platform_id가 없을 경우 fallback으로 사용.",
    )

    description: Optional[str] = Field(None, max_length=500, description="그룹 설명")
    schedule_cron: str = Field(default="0 9 * * *", description="스케줄 Cron 표현식")
    is_active: bool = Field(True, description="활성화 여부")


class GroupUpdate(BaseModel):
    """그룹 수정 스키마"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    schedule_cron: Optional[str] = None
    is_active: Optional[bool] = None
    # platform_id는 일반적으로 변경하지 않음 (데이터 무결성)
    # 필요한 경우 별도 API로 처리


class Group(BaseModel):
    """
    그룹 응답 스키마

    플랫폼 정보는 platform_id로 참조.
    type은 하위 호환성을 위해 유지되지만 deprecated.
    """

    id: str
    name: str
    platform_id: str = Field(..., description="플랫폼 ID")

    # [DEPRECATED] type 필드 - platform_id를 통해 플랫폼 정보 조회 권장
    type: ChannelType = Field(
        ...,
        description="[DEPRECATED] 채널 유형. platforms.key와 동일. platform_id 사용 권장.",
    )

    description: Optional[str] = None
    schedule_cron: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GroupWithPlatform(Group):
    """플랫폼 정보를 포함한 그룹 응답 스키마"""

    platform: Optional[Platform] = Field(None, description="플랫폼 상세 정보")


# ============ 채널 스키마 ============


class ChannelBase(BaseModel):
    """
    채널 기본 스키마

    채널은 그룹에 종속되며, 플랫폼 정보는 그룹(group_id)을 통해 간접 참조합니다.
    channels.type은 그룹의 platform과 일치해야 하며, 향후 제거될 예정입니다.
    """

    name: str = Field(..., min_length=1, max_length=100, description="채널명")

    # [DEPRECATED] type 필드 - 그룹의 platform을 따름
    # 채널 생성 시 그룹의 platform과 일치 여부 검증
    type: ChannelType = Field(
        ...,
        description="[DEPRECATED] 채널 유형. 그룹의 platform과 일치해야 함. "
        "향후 그룹의 platform_id를 통해 간접 참조로 변경 예정.",
    )

    config: Dict[str, Any] = Field(default_factory=dict, description="채널별 설정")


class ChannelCreate(ChannelBase):
    """채널 생성 스키마"""

    group_id: str = Field(..., description="소속 그룹 ID")


class ChannelUpdate(BaseModel):
    """채널 수정 스키마"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    config: Optional[Dict[str, Any]] = None
    status: Optional[ChannelStatus] = None


class Channel(ChannelBase):
    """채널 응답 스키마"""

    id: str
    group_id: str
    status: ChannelStatus
    last_run_at: Optional[datetime] = None
    last_run_status: Optional[Literal["success", "failed"]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ 스케줄 스키마 ============


class ScheduleBase(BaseModel):
    """스케줄 기본 스키마"""

    target_type: TargetType = Field(..., description="대상 유형: group 또는 channel")
    target_id: str = Field(..., description="대상 ID (group_id 또는 channel_id)")
    cron: str = Field(..., description="Cron 표현식")
    is_active: bool = Field(True, description="활성화 여부")


class ScheduleCreate(ScheduleBase):
    """스케줄 생성 스키마"""

    pass


class ScheduleUpdate(BaseModel):
    """스케줄 수정 스키마"""

    cron: Optional[str] = None
    is_active: Optional[bool] = None


class Schedule(ScheduleBase):
    """스케줄 응답 스키마"""

    id: str
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScheduleWithTarget(Schedule):
    """대상 정보를 포함한 스케줄 응답 스키마"""

    target_name: Optional[str] = None  # 그룹명 또는 채널명


# ============ 실행 로그 스키마 ============


class RunLogCreate(BaseModel):
    """실행 로그 생성 스키마"""

    channel_id: str
    group_id: Optional[str] = None


class RunLog(BaseModel):
    """실행 로그 응답 스키마"""

    id: str
    channel_id: str
    group_id: Optional[str] = None
    status: RunStatus
    started_at: datetime
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    result: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


# ============ 통계 스키마 ============


class Stats(BaseModel):
    """통계 스키마"""

    id: str
    channel_id: str
    date: str
    views: int = 0
    subscribers: int = 0
    likes: int = 0
    comments: int = 0
    posts_count: int = 0

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    """대시보드 요약 통계"""

    scheduled: int = Field(0, description="예정된 작업 수")
    running: int = Field(0, description="실행 중인 작업 수")
    completed: int = Field(0, description="완료된 작업 수")
    failed: int = Field(0, description="실패한 작업 수")


# ============ 공통 응답 스키마 ============


class MessageResponse(BaseModel):
    """메시지 응답"""

    message: str
