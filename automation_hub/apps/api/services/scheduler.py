"""
APScheduler 기반 스케줄러 설정
schedules 테이블과 연동
"""

from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from core.logger import setup_logger

logger = setup_logger(__name__)

# 전역 스케줄러 인스턴스
scheduler = AsyncIOScheduler(timezone="Asia/Seoul")


def parse_cron(cron_expression: str) -> dict:
    """
    Cron 표현식을 파싱하여 APScheduler 형식으로 변환
    형식: minute hour day_of_month month day_of_week
    """
    parts = cron_expression.strip().split()
    if len(parts) != 5:
        raise ValueError(f"잘못된 Cron 표현식: {cron_expression}")

    return {
        "minute": parts[0],
        "hour": parts[1],
        "day": parts[2],
        "month": parts[3],
        "day_of_week": parts[4],
    }


async def execute_schedule_job(schedule_id: str, target_type: str, target_id: str):
    """
    스케줄 Job 실행
    target_type에 따라 그룹 또는 채널 실행
    """
    from services.executor import execute_group, execute_channel
    from core.database import update_schedule

    logger.info(f"스케줄 트리거: {schedule_id} ({target_type}: {target_id})")

    # last_run_at 업데이트
    await update_schedule(schedule_id, {"last_run_at": datetime.utcnow().isoformat()})

    # 대상 유형에 따라 실행
    if target_type == "group":
        await execute_group(target_id)
    elif target_type == "channel":
        await execute_channel(target_id)


def register_schedule(
    schedule_id: str,
    target_type: str,
    target_id: str,
    cron_expression: str,
):
    """스케줄 등록"""
    job_id = schedule_id  # 스케줄 ID를 Job ID로 사용

    # 기존 작업이 있으면 제거
    existing_job = scheduler.get_job(job_id)
    if existing_job:
        scheduler.remove_job(job_id)

    try:
        cron_params = parse_cron(cron_expression)
        trigger = CronTrigger(**cron_params)

        scheduler.add_job(
            execute_schedule_job,
            trigger=trigger,
            id=job_id,
            args=[schedule_id, target_type, target_id],
            replace_existing=True,
        )
        logger.info(f"스케줄 등록: {schedule_id} ({target_type}: {target_id}), Cron: {cron_expression}")
    except Exception as e:
        logger.error(f"스케줄 등록 실패: {schedule_id}, 오류: {e}")
        raise


def remove_schedule(schedule_id: str):
    """스케줄 제거"""
    job = scheduler.get_job(schedule_id)

    if job:
        scheduler.remove_job(schedule_id)
        logger.info(f"스케줄 제거: {schedule_id}")


def pause_schedule(schedule_id: str):
    """스케줄 일시정지"""
    job = scheduler.get_job(schedule_id)
    if job:
        scheduler.pause_job(schedule_id)
        logger.info(f"스케줄 일시정지: {schedule_id}")


def resume_schedule(schedule_id: str):
    """스케줄 재개"""
    job = scheduler.get_job(schedule_id)
    if job:
        scheduler.resume_job(schedule_id)
        logger.info(f"스케줄 재개: {schedule_id}")


def get_next_run_time(schedule_id: str) -> datetime | None:
    """다음 실행 시간 조회"""
    job = scheduler.get_job(schedule_id)

    if job:
        next_run = getattr(job, "next_run_time", None)
        if next_run:
            return next_run
    return None


# ============ 기존 호환성 유지 (deprecated) ============


def register_group_schedule(group_id: str, cron_expression: str):
    """
    그룹 스케줄 등록 (deprecated)
    기존 코드 호환을 위해 유지, 새 코드는 register_schedule 사용 권장
    """
    job_id = f"group_{group_id}"
    register_schedule(
        schedule_id=job_id,
        target_type="group",
        target_id=group_id,
        cron_expression=cron_expression,
    )


def remove_group_schedule(group_id: str):
    """
    그룹 스케줄 제거 (deprecated)
    기존 코드 호환을 위해 유지
    """
    job_id = f"group_{group_id}"
    remove_schedule(job_id)
