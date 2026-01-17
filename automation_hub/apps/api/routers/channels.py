"""
채널 관리 API 라우터

채널(Channel)은 그룹에 종속되며, 플랫폼 정보는 그룹을 통해 간접 참조합니다.

데이터 계층 구조:
  platforms → groups → channels
  (플랫폼)    (그룹)    (채널)

채널의 플랫폼:
- 채널은 직접 platform_id를 갖지 않음
- 소속 그룹(group_id)의 platform_id를 통해 플랫폼 결정
- channels.type은 그룹의 platform.key와 일치해야 함 (검증)
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from models.schemas import Channel, ChannelCreate, ChannelUpdate
from core.database import (
    get_all_channels,
    get_channels_by_platform,
    get_channel_by_id,
    create_channel,
    update_channel,
    delete_channel,
    get_group_by_id,
    get_platform_by_id,
)

router = APIRouter()


@router.get("", response_model=List[Channel])
async def list_channels(
    group_id: Optional[str] = Query(None, description="그룹 ID 필터"),
    platform_id: Optional[str] = Query(None, description="플랫폼 ID 필터"),
):
    """
    채널 목록 조회

    - group_id: 특정 그룹의 채널만 조회
    - platform_id: 특정 플랫폼의 모든 채널 조회 (그룹 통해 필터)
    """
    if platform_id:
        # 플랫폼 존재 확인
        platform = await get_platform_by_id(platform_id)
        if not platform:
            raise HTTPException(status_code=404, detail="플랫폼을 찾을 수 없습니다")
        channels = await get_channels_by_platform(platform_id)
    else:
        channels = await get_all_channels(group_id)
    return channels


@router.get("/{channel_id}", response_model=Channel)
async def get_channel(channel_id: str):
    """특정 채널 조회"""
    channel = await get_channel_by_id(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="채널을 찾을 수 없습니다")
    return channel


@router.post("", response_model=Channel, status_code=201)
async def create_new_channel(channel_data: ChannelCreate):
    """
    새 채널 생성

    채널의 type은 소속 그룹의 플랫폼(platform.key)과 일치해야 합니다.
    일치하지 않으면 에러를 반환합니다.
    """
    # 그룹 존재 확인
    group = await get_group_by_id(channel_data.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")

    # 그룹의 플랫폼 정보 확인 (platform_id 또는 type으로)
    group_platform_key = group.get("type")  # 현재는 type으로 확인

    # platform_id가 있으면 해당 플랫폼의 key 조회
    if group.get("platform_id"):
        platform = await get_platform_by_id(group["platform_id"])
        if platform:
            group_platform_key = platform["key"]

    # 채널 유형이 그룹의 플랫폼과 일치하는지 확인
    if channel_data.type != group_platform_key:
        raise HTTPException(
            status_code=400,
            detail=f"채널 유형이 그룹의 플랫폼과 일치하지 않습니다. "
            f"그룹 플랫폼: {group_platform_key}, 요청된 채널 유형: {channel_data.type}",
        )

    channel = await create_channel(channel_data.model_dump())
    if not channel:
        raise HTTPException(status_code=500, detail="채널 생성에 실패했습니다")
    return channel


@router.put("/{channel_id}", response_model=Channel)
async def update_existing_channel(channel_id: str, channel_data: ChannelUpdate):
    """채널 정보 수정"""
    existing = await get_channel_by_id(channel_id)
    if not existing:
        raise HTTPException(status_code=404, detail="채널을 찾을 수 없습니다")

    update_data = channel_data.model_dump(exclude_unset=True)
    if not update_data:
        return existing

    channel = await update_channel(channel_id, update_data)
    return channel


@router.delete("/{channel_id}", status_code=204)
async def delete_existing_channel(channel_id: str):
    """채널 삭제"""
    existing = await get_channel_by_id(channel_id)
    if not existing:
        raise HTTPException(status_code=404, detail="채널을 찾을 수 없습니다")

    await delete_channel(channel_id)
    return None
