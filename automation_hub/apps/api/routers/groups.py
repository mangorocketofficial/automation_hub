"""
그룹 관리 API 라우터

그룹(Group)은 특정 플랫폼에 속하며, 여러 채널을 포함합니다.

데이터 계층 구조:
  platforms → groups → channels
  (플랫폼)    (그룹)    (채널)

그룹 생성 시:
- platform_id 사용 권장 (새 클라이언트)
- type만 전달 시 자동으로 platform_id 매핑 (하위 호환성)
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from models.schemas import Group, GroupCreate, GroupUpdate, GroupWithPlatform
from core.database import (
    get_all_groups,
    get_groups_with_platform,
    get_group_by_id,
    get_group_with_platform,
    create_group,
    update_group,
    delete_group,
    get_platform_by_id,
    get_platform_by_key,
)

router = APIRouter()


@router.get("", response_model=List[Group])
async def list_groups(
    platform_id: Optional[str] = Query(None, description="플랫폼 ID 필터"),
    include_platform: bool = Query(False, description="플랫폼 정보 포함 여부"),
):
    """
    모든 그룹 목록 조회

    - platform_id: 특정 플랫폼의 그룹만 조회
    - include_platform: true이면 플랫폼 상세 정보 포함
    """
    if include_platform:
        groups = await get_groups_with_platform()
        # platform_id 필터 적용
        if platform_id:
            groups = [g for g in groups if g.get("platform_id") == platform_id]
        return groups
    else:
        groups = await get_all_groups(platform_id=platform_id)
        return groups


@router.get("/{group_id}", response_model=Group)
async def get_group(
    group_id: str,
    include_platform: bool = Query(False, description="플랫폼 정보 포함 여부"),
):
    """특정 그룹 조회"""
    if include_platform:
        group = await get_group_with_platform(group_id)
    else:
        group = await get_group_by_id(group_id)

    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")
    return group


@router.post("", response_model=Group, status_code=201)
async def create_new_group(group_data: GroupCreate):
    """
    새 그룹 생성

    플랫폼 지정 방식:
    1. platform_id 직접 지정 (권장)
    2. type만 지정 시 자동으로 platform_id 매핑 (하위 호환성)
    3. 둘 다 지정 시 platform_id 우선 사용

    platform_id와 type 둘 다 없으면 에러
    """
    data = group_data.model_dump(exclude_unset=True)

    platform_id = data.get("platform_id")
    channel_type = data.get("type")

    # platform_id 결정 로직
    if platform_id:
        # platform_id가 있으면 유효성 확인
        platform = await get_platform_by_id(platform_id)
        if not platform:
            raise HTTPException(
                status_code=400,
                detail=f"플랫폼 ID '{platform_id}'를 찾을 수 없습니다",
            )
        # type이 없으면 platform.key로 설정 (하위 호환성)
        if not channel_type:
            data["type"] = platform["key"]

    elif channel_type:
        # type만 있으면 platform_id 자동 매핑
        platform = await get_platform_by_key(channel_type)
        if not platform:
            raise HTTPException(
                status_code=400,
                detail=f"플랫폼 키 '{channel_type}'를 찾을 수 없습니다. "
                "먼저 해당 플랫폼을 생성하세요.",
            )
        data["platform_id"] = platform["id"]

    else:
        # 둘 다 없으면 에러
        raise HTTPException(
            status_code=400,
            detail="platform_id 또는 type 중 하나는 필수입니다",
        )

    group = await create_group(data)
    if not group:
        raise HTTPException(status_code=500, detail="그룹 생성에 실패했습니다")
    return group


@router.put("/{group_id}", response_model=Group)
async def update_existing_group(group_id: str, group_data: GroupUpdate):
    """그룹 정보 수정"""
    existing = await get_group_by_id(group_id)
    if not existing:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")

    update_data = group_data.model_dump(exclude_unset=True)
    if not update_data:
        return existing

    group = await update_group(group_id, update_data)
    return group


@router.delete("/{group_id}", status_code=204)
async def delete_existing_group(group_id: str):
    """그룹 삭제"""
    existing = await get_group_by_id(group_id)
    if not existing:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")

    await delete_group(group_id)
    return None
