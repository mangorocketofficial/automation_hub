"""
실행 제어 API 라우터
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks

from models.schemas import MessageResponse
from core.database import (
    get_all_groups,
    get_group_by_id,
    get_channel_by_id,
    get_all_channels,
)
from services.executor import execute_group, execute_channel, stop_all_tasks

router = APIRouter()


@router.post("/run/all", response_model=MessageResponse)
async def run_all(background_tasks: BackgroundTasks):
    """모든 활성 그룹 즉시 실행"""
    groups = await get_all_groups()
    active_groups = [g for g in groups if g["is_active"]]

    if not active_groups:
        raise HTTPException(status_code=400, detail="실행할 활성 그룹이 없습니다")

    # 백그라운드에서 실행
    for group in active_groups:
        background_tasks.add_task(execute_group, group["id"])

    return MessageResponse(
        message=f"{len(active_groups)}개 그룹의 작업이 시작되었습니다"
    )


@router.post("/run/group/{group_id}", response_model=MessageResponse)
async def run_group(group_id: str, background_tasks: BackgroundTasks):
    """특정 그룹 즉시 실행"""
    group = await get_group_by_id(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")

    # 그룹 내 채널 수 확인
    channels = await get_all_channels(group_id)
    if not channels:
        raise HTTPException(status_code=400, detail="그룹에 채널이 없습니다")

    # 백그라운드에서 실행
    background_tasks.add_task(execute_group, group_id)

    return MessageResponse(
        message=f"그룹 '{group['name']}'의 {len(channels)}개 채널 작업이 시작되었습니다"
    )


@router.post("/run/channel/{channel_id}", response_model=MessageResponse)
async def run_channel(channel_id: str, background_tasks: BackgroundTasks):
    """특정 채널 즉시 실행"""
    channel = await get_channel_by_id(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="채널을 찾을 수 없습니다")

    if channel["status"] == "paused":
        raise HTTPException(status_code=400, detail="일시정지된 채널입니다")

    # 백그라운드에서 실행
    background_tasks.add_task(execute_channel, channel_id)

    return MessageResponse(message=f"채널 '{channel['name']}' 작업이 시작되었습니다")


@router.post("/stop/all", response_model=MessageResponse)
async def stop_all():
    """실행 중인 모든 작업 중지"""
    stopped_count = await stop_all_tasks()
    return MessageResponse(message=f"{stopped_count}개 작업이 중지되었습니다")
