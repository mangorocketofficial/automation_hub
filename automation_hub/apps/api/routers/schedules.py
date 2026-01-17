"""
스케줄 관리 API 라우터
schedules 테이블 기반 CRUD 및 스케줄러 연동
"""

from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException

from models.schemas import (
    Schedule,
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleWithTarget,
    MessageResponse,
)
from core.database import (
    get_all_schedules,
    get_schedule_by_id,
    get_active_schedules,
    create_schedule,
    update_schedule,
    delete_schedule,
    get_group_by_id,
    get_channel_by_id,
)
from services.scheduler import (
    scheduler,
    register_schedule,
    remove_schedule,
    get_next_run_time,
)

router = APIRouter()


# ============ 스케줄 CRUD ============


@router.get("", response_model=List[ScheduleWithTarget])
async def list_schedules():
    """모든 스케줄 목록 조회 (대상 정보 포함)"""
    schedules = await get_all_schedules()
    result = []

    for schedule in schedules:
        target_name = None

        # 대상 이름 조회
        if schedule["target_type"] == "group":
            group = await get_group_by_id(schedule["target_id"])
            target_name = group["name"] if group else None
        elif schedule["target_type"] == "channel":
            channel = await get_channel_by_id(schedule["target_id"])
            target_name = channel["name"] if channel else None

        # 다음 실행 시간 업데이트
        next_run = get_next_run_time(schedule["id"])

        # next_run_at 필드를 덮어쓰기 위해 복사본 생성
        schedule_data = {**schedule}
        schedule_data["next_run_at"] = next_run

        result.append(
            ScheduleWithTarget(
                **schedule_data,
                target_name=target_name,
            )
        )

    return result


@router.get("/{schedule_id}", response_model=ScheduleWithTarget)
async def get_schedule(schedule_id: str):
    """특정 스케줄 조회"""
    schedule = await get_schedule_by_id(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="스케줄을 찾을 수 없습니다")

    # 대상 이름 조회
    target_name = None
    if schedule["target_type"] == "group":
        group = await get_group_by_id(schedule["target_id"])
        target_name = group["name"] if group else None
    elif schedule["target_type"] == "channel":
        channel = await get_channel_by_id(schedule["target_id"])
        target_name = channel["name"] if channel else None

    return ScheduleWithTarget(**schedule, target_name=target_name)


@router.post("", response_model=Schedule, status_code=201)
async def create_new_schedule(schedule_data: ScheduleCreate):
    """새 스케줄 생성"""
    # 대상 존재 확인
    if schedule_data.target_type == "group":
        target = await get_group_by_id(schedule_data.target_id)
        if not target:
            raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")
    elif schedule_data.target_type == "channel":
        target = await get_channel_by_id(schedule_data.target_id)
        if not target:
            raise HTTPException(status_code=404, detail="채널을 찾을 수 없습니다")

    # DB에 스케줄 생성
    schedule = await create_schedule(schedule_data.model_dump())
    if not schedule:
        raise HTTPException(status_code=500, detail="스케줄 생성에 실패했습니다")

    # 활성 상태면 스케줄러에 등록
    if schedule["is_active"]:
        register_schedule(
            schedule_id=schedule["id"],
            target_type=schedule["target_type"],
            target_id=schedule["target_id"],
            cron_expression=schedule["cron"],
        )

    return schedule


@router.put("/{schedule_id}", response_model=Schedule)
async def update_existing_schedule(schedule_id: str, schedule_data: ScheduleUpdate):
    """스케줄 수정"""
    existing = await get_schedule_by_id(schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="스케줄을 찾을 수 없습니다")

    update_data = schedule_data.model_dump(exclude_unset=True)
    if not update_data:
        return existing

    # DB 업데이트
    schedule = await update_schedule(schedule_id, update_data)

    # 스케줄러 업데이트
    remove_schedule(schedule_id)
    if schedule["is_active"]:
        register_schedule(
            schedule_id=schedule["id"],
            target_type=schedule["target_type"],
            target_id=schedule["target_id"],
            cron_expression=schedule["cron"],
        )

    return schedule


@router.delete("/{schedule_id}", status_code=204)
async def delete_existing_schedule(schedule_id: str):
    """스케줄 삭제"""
    existing = await get_schedule_by_id(schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="스케줄을 찾을 수 없습니다")

    # 스케줄러에서 제거
    remove_schedule(schedule_id)

    # DB에서 삭제
    await delete_schedule(schedule_id)
    return None


# ============ 스케줄 제어 ============


@router.post("/{schedule_id}/pause", response_model=MessageResponse)
async def pause_schedule(schedule_id: str):
    """스케줄 일시정지"""
    schedule = await get_schedule_by_id(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="스케줄을 찾을 수 없습니다")

    # DB 업데이트
    await update_schedule(schedule_id, {"is_active": False})

    # 스케줄러에서 제거
    remove_schedule(schedule_id)

    return MessageResponse(message="스케줄이 일시정지되었습니다")


@router.post("/{schedule_id}/resume", response_model=MessageResponse)
async def resume_schedule(schedule_id: str):
    """스케줄 재개"""
    schedule = await get_schedule_by_id(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="스케줄을 찾을 수 없습니다")

    # DB 업데이트
    await update_schedule(schedule_id, {"is_active": True})

    # 스케줄러에 등록
    register_schedule(
        schedule_id=schedule["id"],
        target_type=schedule["target_type"],
        target_id=schedule["target_id"],
        cron_expression=schedule["cron"],
    )

    return MessageResponse(message="스케줄이 재개되었습니다")


# ============ 스케줄러 동기화 ============


@router.post("/sync", response_model=MessageResponse)
async def sync_schedules():
    """데이터베이스와 스케줄러 동기화"""
    # 기존 스케줄 모두 제거
    for job in scheduler.get_jobs():
        scheduler.remove_job(job.id)

    # 활성 스케줄만 조회하여 등록
    active_schedules = await get_active_schedules()
    registered_count = 0

    for schedule in active_schedules:
        register_schedule(
            schedule_id=schedule["id"],
            target_type=schedule["target_type"],
            target_id=schedule["target_id"],
            cron_expression=schedule["cron"],
        )
        registered_count += 1

    all_schedules = await get_all_schedules()

    return MessageResponse(
        message=f"스케줄 동기화 완료: 전체 {len(all_schedules)}개 중 {registered_count}개 활성화"
    )


@router.get("/status/jobs")
async def get_scheduler_jobs():
    """현재 스케줄러에 등록된 Job 목록"""
    jobs = scheduler.get_jobs()

    result = []
    for job in jobs:
        next_run = getattr(job, "next_run_time", None)
        result.append({
            "job_id": job.id,
            "next_run_time": str(next_run) if next_run else None,
            "is_paused": next_run is None,
        })
    return result
