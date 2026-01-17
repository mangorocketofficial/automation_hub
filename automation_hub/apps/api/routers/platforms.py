"""
플랫폼 관리 API 라우터

플랫폼(Platform)은 데이터 계층의 최상위 개념으로,
지원하는 콘텐츠 플랫폼(YouTube Shorts, Naver Blog 등)을 정의합니다.

데이터 계층 구조:
  platforms → groups → channels
  (플랫폼)    (그룹)    (채널)
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from models.schemas import Platform, PlatformCreate, PlatformUpdate
from core.database import (
    get_all_platforms,
    get_platform_by_id,
    get_platform_by_key,
    create_platform,
    update_platform,
    delete_platform,
    get_all_groups,
)

router = APIRouter()


@router.get("", response_model=List[Platform])
async def list_platforms(
    active_only: bool = Query(False, description="활성 플랫폼만 조회")
):
    """
    모든 플랫폼 목록 조회

    - active_only=true: 활성화된 플랫폼만 반환
    """
    platforms = await get_all_platforms(active_only=active_only)
    return platforms


@router.get("/{platform_id}", response_model=Platform)
async def get_platform(platform_id: str):
    """특정 플랫폼 조회 (ID 또는 key로 조회)"""
    # UUID 형식이 아니면 key로 간주하여 조회 시도
    platform = await get_platform_by_id(platform_id)
    if not platform:
        # key로 재시도
        platform = await get_platform_by_key(platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="플랫폼을 찾을 수 없습니다")
    return platform


@router.get("/key/{platform_key}", response_model=Platform)
async def get_platform_by_key_endpoint(platform_key: str):
    """
    플랫폼 키로 조회

    Args:
        platform_key: 플랫폼 식별 키 (예: youtube_shorts, naver_blog)
    """
    platform = await get_platform_by_key(platform_key)
    if not platform:
        raise HTTPException(status_code=404, detail="플랫폼을 찾을 수 없습니다")
    return platform


@router.post("", response_model=Platform, status_code=201)
async def create_new_platform(platform_data: PlatformCreate):
    """
    새 플랫폼 생성

    주의: 일반적으로 플랫폼은 마이그레이션으로 미리 정의됨.
    런타임에 새 플랫폼을 추가하는 것은 권장되지 않음.
    """
    # 중복 키 확인
    existing = await get_platform_by_key(platform_data.key)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"플랫폼 키 '{platform_data.key}'가 이미 존재합니다",
        )

    platform = await create_platform(platform_data.model_dump())
    if not platform:
        raise HTTPException(status_code=500, detail="플랫폼 생성에 실패했습니다")
    return platform


@router.put("/{platform_id}", response_model=Platform)
async def update_existing_platform(platform_id: str, platform_data: PlatformUpdate):
    """플랫폼 정보 수정"""
    existing = await get_platform_by_id(platform_id)
    if not existing:
        raise HTTPException(status_code=404, detail="플랫폼을 찾을 수 없습니다")

    update_data = platform_data.model_dump(exclude_unset=True)
    if not update_data:
        return existing

    platform = await update_platform(platform_id, update_data)
    return platform


@router.delete("/{platform_id}", status_code=204)
async def delete_existing_platform(platform_id: str):
    """
    플랫폼 삭제

    주의: 해당 플랫폼에 연결된 그룹이 있으면 삭제 불가 (FK 제약)
    """
    existing = await get_platform_by_id(platform_id)
    if not existing:
        raise HTTPException(status_code=404, detail="플랫폼을 찾을 수 없습니다")

    # 연결된 그룹이 있는지 확인
    groups = await get_all_groups(platform_id=platform_id)
    if groups:
        raise HTTPException(
            status_code=400,
            detail=f"플랫폼에 연결된 그룹이 {len(groups)}개 있어 삭제할 수 없습니다. "
            "먼저 그룹을 삭제하거나 다른 플랫폼으로 이동하세요.",
        )

    await delete_platform(platform_id)
    return None
