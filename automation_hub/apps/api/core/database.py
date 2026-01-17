"""
Supabase 데이터베이스 연결 관리

데이터 계층 구조:
  platforms → groups → channels
  (플랫폼)    (그룹)    (채널)

- Platform: 콘텐츠 플랫폼 마스터 데이터
- Group: 플랫폼별 채널 그룹 (platform_id로 플랫폼 참조)
- Channel: 개별 채널 (group_id로 그룹/플랫폼 참조)
"""

from functools import lru_cache
from typing import Optional, List, Dict

from supabase import create_client, Client
from postgrest.exceptions import APIError

from core.config import settings


@lru_cache()
def get_supabase_client() -> Client:
    """Supabase 클라이언트 반환 (캐시됨)"""
    return create_client(settings.supabase_url, settings.supabase_key)


# 전역 Supabase 클라이언트
supabase = get_supabase_client()


# ============ 플랫폼 CRUD ============


async def get_all_platforms(active_only: bool = False) -> List[Dict]:
    """
    모든 플랫폼 조회

    Args:
        active_only: True이면 활성 플랫폼만 조회
    """
    query = supabase.table("platforms").select("*")
    if active_only:
        query = query.eq("is_active", True)
    response = query.order("created_at").execute()
    return response.data


async def get_platform_by_id(platform_id: str) -> Optional[Dict]:
    """ID로 플랫폼 조회"""
    try:
        response = (
            supabase.table("platforms")
            .select("*")
            .eq("id", platform_id)
            .single()
            .execute()
        )
        return response.data
    except APIError as e:
        if e.code == "PGRST116":  # No rows found
            return None
        raise


async def get_platform_by_key(platform_key: str) -> Optional[Dict]:
    """
    플랫폼 키로 조회

    Args:
        platform_key: 플랫폼 식별 키 (예: 'youtube_shorts', 'naver_blog')
    """
    try:
        response = (
            supabase.table("platforms")
            .select("*")
            .eq("key", platform_key)
            .single()
            .execute()
        )
        return response.data
    except APIError as e:
        if e.code == "PGRST116":  # No rows found
            return None
        raise


async def create_platform(platform_data: dict) -> Optional[Dict]:
    """플랫폼 생성"""
    response = supabase.table("platforms").insert(platform_data).execute()
    return response.data[0] if response.data else None


async def update_platform(platform_id: str, platform_data: dict) -> Optional[Dict]:
    """플랫폼 수정"""
    response = (
        supabase.table("platforms")
        .update(platform_data)
        .eq("id", platform_id)
        .execute()
    )
    return response.data[0] if response.data else None


async def delete_platform(platform_id: str) -> List:
    """
    플랫폼 삭제

    주의: 플랫폼에 연결된 그룹이 있으면 FK 제약으로 삭제 실패
    """
    response = supabase.table("platforms").delete().eq("id", platform_id).execute()
    return response.data


# ============ 그룹 CRUD ============


async def get_all_groups(platform_id: str = None) -> List[Dict]:
    """
    모든 그룹 조회

    Args:
        platform_id: 특정 플랫폼의 그룹만 조회 (선택)
    """
    query = supabase.table("groups").select("*")
    if platform_id:
        query = query.eq("platform_id", platform_id)
    response = query.order("created_at").execute()
    return response.data


async def get_groups_with_platform() -> List[Dict]:
    """플랫폼 정보를 포함한 그룹 목록 조회"""
    response = (
        supabase.table("groups")
        .select("*, platform:platforms(*)")
        .order("created_at")
        .execute()
    )
    return response.data


async def get_group_by_id(group_id: str) -> Optional[Dict]:
    """ID로 그룹 조회"""
    try:
        response = (
            supabase.table("groups").select("*").eq("id", group_id).single().execute()
        )
        return response.data
    except APIError as e:
        if e.code == "PGRST116":  # No rows found
            return None
        raise


async def get_group_with_platform(group_id: str) -> Optional[Dict]:
    """플랫폼 정보를 포함한 그룹 조회"""
    try:
        response = (
            supabase.table("groups")
            .select("*, platform:platforms(*)")
            .eq("id", group_id)
            .single()
            .execute()
        )
        return response.data
    except APIError as e:
        if e.code == "PGRST116":  # No rows found
            return None
        raise


async def create_group(group_data: dict) -> Optional[Dict]:
    """그룹 생성"""
    response = supabase.table("groups").insert(group_data).execute()
    return response.data[0] if response.data else None


async def update_group(group_id: str, group_data: dict) -> Optional[Dict]:
    """그룹 수정"""
    response = (
        supabase.table("groups").update(group_data).eq("id", group_id).execute()
    )
    return response.data[0] if response.data else None


async def delete_group(group_id: str) -> List:
    """그룹 삭제"""
    response = supabase.table("groups").delete().eq("id", group_id).execute()
    return response.data


# ============ 채널 CRUD ============


async def get_all_channels(group_id: str = None) -> List[Dict]:
    """모든 채널 조회 (그룹 필터 선택적)"""
    query = supabase.table("channels").select("*")
    if group_id:
        query = query.eq("group_id", group_id)
    response = query.order("created_at").execute()
    return response.data


async def get_channels_by_platform(platform_id: str) -> List[Dict]:
    """
    특정 플랫폼의 모든 채널 조회

    그룹을 통해 플랫폼과 연결된 채널 목록 반환
    """
    # 먼저 해당 플랫폼의 그룹 ID들을 조회
    groups_response = (
        supabase.table("groups")
        .select("id")
        .eq("platform_id", platform_id)
        .execute()
    )
    group_ids = [g["id"] for g in groups_response.data]

    if not group_ids:
        return []

    # 해당 그룹들의 채널 조회
    response = (
        supabase.table("channels")
        .select("*")
        .in_("group_id", group_ids)
        .order("created_at")
        .execute()
    )
    return response.data


async def get_channel_by_id(channel_id: str) -> Optional[Dict]:
    """ID로 채널 조회"""
    try:
        response = (
            supabase.table("channels")
            .select("*")
            .eq("id", channel_id)
            .single()
            .execute()
        )
        return response.data
    except APIError as e:
        if e.code == "PGRST116":  # No rows found
            return None
        raise


async def create_channel(channel_data: dict) -> Optional[Dict]:
    """채널 생성"""
    response = supabase.table("channels").insert(channel_data).execute()
    return response.data[0] if response.data else None


async def update_channel(channel_id: str, channel_data: dict) -> Optional[Dict]:
    """채널 수정"""
    response = (
        supabase.table("channels").update(channel_data).eq("id", channel_id).execute()
    )
    return response.data[0] if response.data else None


async def delete_channel(channel_id: str) -> List:
    """채널 삭제"""
    response = supabase.table("channels").delete().eq("id", channel_id).execute()
    return response.data


# ============ 스케줄 CRUD ============


async def get_all_schedules() -> List[Dict]:
    """모든 스케줄 조회"""
    response = supabase.table("schedules").select("*").order("created_at").execute()
    return response.data


async def get_schedule_by_id(schedule_id: str) -> Optional[Dict]:
    """ID로 스케줄 조회"""
    try:
        response = (
            supabase.table("schedules")
            .select("*")
            .eq("id", schedule_id)
            .single()
            .execute()
        )
        return response.data
    except APIError as e:
        if e.code == "PGRST116":  # No rows found
            return None
        raise


async def get_schedules_by_target(target_type: str, target_id: str) -> List[Dict]:
    """대상별 스케줄 조회"""
    response = (
        supabase.table("schedules")
        .select("*")
        .eq("target_type", target_type)
        .eq("target_id", target_id)
        .execute()
    )
    return response.data


async def get_active_schedules() -> List[Dict]:
    """활성 스케줄만 조회"""
    response = (
        supabase.table("schedules")
        .select("*")
        .eq("is_active", True)
        .order("created_at")
        .execute()
    )
    return response.data


async def create_schedule(schedule_data: dict) -> Optional[Dict]:
    """스케줄 생성"""
    response = supabase.table("schedules").insert(schedule_data).execute()
    return response.data[0] if response.data else None


async def update_schedule(schedule_id: str, schedule_data: dict) -> Optional[Dict]:
    """스케줄 수정"""
    response = (
        supabase.table("schedules")
        .update(schedule_data)
        .eq("id", schedule_id)
        .execute()
    )
    return response.data[0] if response.data else None


async def delete_schedule(schedule_id: str) -> List:
    """스케줄 삭제"""
    response = supabase.table("schedules").delete().eq("id", schedule_id).execute()
    return response.data


# ============ 실행 로그 CRUD ============


async def create_run_log(log_data: dict) -> Optional[Dict]:
    """실행 로그 생성"""
    response = supabase.table("run_logs").insert(log_data).execute()
    return response.data[0] if response.data else None


async def update_run_log(log_id: str, log_data: dict) -> Optional[Dict]:
    """실행 로그 수정"""
    response = (
        supabase.table("run_logs").update(log_data).eq("id", log_id).execute()
    )
    return response.data[0] if response.data else None


async def get_run_logs(channel_id: str = None, limit: int = 50) -> List[Dict]:
    """실행 로그 조회"""
    query = supabase.table("run_logs").select("*")
    if channel_id:
        query = query.eq("channel_id", channel_id)
    response = query.order("started_at", desc=True).limit(limit).execute()
    return response.data


# ============ 통계 CRUD ============


async def get_stats(channel_id: str, days: int = 30) -> List[Dict]:
    """채널 통계 조회"""
    response = (
        supabase.table("stats")
        .select("*")
        .eq("channel_id", channel_id)
        .order("date", desc=True)
        .limit(days)
        .execute()
    )
    return response.data


async def upsert_stats(stats_data: dict) -> Optional[Dict]:
    """통계 업서트"""
    response = supabase.table("stats").upsert(stats_data).execute()
    return response.data[0] if response.data else None
