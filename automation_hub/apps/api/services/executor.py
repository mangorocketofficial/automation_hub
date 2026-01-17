"""
작업 실행 관리
워커를 통한 실제 자동화 작업 실행
"""

import asyncio
from datetime import datetime
from typing import Dict, Set

from core.logger import setup_logger
from core.database import (
    get_all_channels,
    get_channel_by_id,
    get_group_by_id,
    create_run_log,
    update_run_log,
    update_channel,
)
from workers.base import BaseWorker
from workers.youtube_shorts.worker import YouTubeShortsWorker
from workers.naver_blog.worker import NaverBlogWorker
from workers.nextjs_blog.worker import NextJSBlogWorker

logger = setup_logger(__name__)

# 실행 중인 작업 추적
running_tasks: Dict[str, asyncio.Task] = {}
stop_requested: Set[str] = set()


def get_worker_for_channel(channel: dict) -> BaseWorker:
    """채널 유형에 맞는 워커 반환"""
    workers = {
        "youtube_shorts": YouTubeShortsWorker,
        "naver_blog": NaverBlogWorker,
        "nextjs_blog": NextJSBlogWorker,
    }

    worker_class = workers.get(channel["type"])
    if not worker_class:
        raise ValueError(f"지원하지 않는 채널 유형: {channel['type']}")

    return worker_class(channel)


async def execute_channel(channel_id: str) -> dict:
    """
    개별 채널 작업 실행
    """
    channel = await get_channel_by_id(channel_id)
    if not channel:
        logger.error(f"채널을 찾을 수 없음: {channel_id}")
        return {"success": False, "error": "채널을 찾을 수 없습니다"}

    # 실행 로그 생성
    log_data = {
        "channel_id": channel_id,
        "group_id": channel.get("group_id"),
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
        "result": {},
    }
    run_log = await create_run_log(log_data)
    log_id = run_log["id"]

    try:
        logger.info(f"채널 실행 시작: {channel['name']} ({channel_id})")

        # 워커 생성 및 실행
        worker = get_worker_for_channel(channel)
        result = await worker.run()

        # 성공 처리
        finished_at = datetime.utcnow()
        started_at = datetime.fromisoformat(log_data["started_at"])
        duration = int((finished_at - started_at).total_seconds())

        await update_run_log(
            log_id,
            {
                "status": "success",
                "finished_at": finished_at.isoformat(),
                "duration_seconds": duration,
                "result": result,
            },
        )

        # 채널 상태 업데이트
        await update_channel(
            channel_id,
            {
                "last_run_at": finished_at.isoformat(),
                "last_run_status": "success",
            },
        )

        logger.info(f"채널 실행 완료: {channel['name']} (소요시간: {duration}초)")
        return {"success": True, "result": result}

    except Exception as e:
        # 실패 처리
        error_message = str(e)
        logger.error(f"채널 실행 실패: {channel['name']}, 오류: {error_message}")

        finished_at = datetime.utcnow()
        started_at = datetime.fromisoformat(log_data["started_at"])
        duration = int((finished_at - started_at).total_seconds())

        await update_run_log(
            log_id,
            {
                "status": "failed",
                "finished_at": finished_at.isoformat(),
                "duration_seconds": duration,
                "error_message": error_message,
            },
        )

        await update_channel(
            channel_id,
            {
                "last_run_at": finished_at.isoformat(),
                "last_run_status": "failed",
                "status": "error",
            },
        )

        return {"success": False, "error": error_message}


async def execute_group(group_id: str) -> dict:
    """
    그룹 내 모든 채널 실행
    """
    group = await get_group_by_id(group_id)
    if not group:
        logger.error(f"그룹을 찾을 수 없음: {group_id}")
        return {"success": False, "error": "그룹을 찾을 수 없습니다"}

    channels = await get_all_channels(group_id)
    active_channels = [c for c in channels if c["status"] == "active"]

    if not active_channels:
        logger.warning(f"그룹에 활성 채널 없음: {group['name']}")
        return {"success": True, "executed": 0, "results": []}

    logger.info(f"그룹 실행 시작: {group['name']} ({len(active_channels)}개 채널)")

    results = []
    for channel in active_channels:
        # 중지 요청 확인
        if group_id in stop_requested:
            logger.info(f"그룹 실행 중지됨: {group['name']}")
            stop_requested.discard(group_id)
            break

        result = await execute_channel(channel["id"])
        results.append({
            "channel_id": channel["id"],
            "channel_name": channel["name"],
            **result,
        })

        # 채널 간 간격 (과부하 방지)
        await asyncio.sleep(2)

    success_count = len([r for r in results if r.get("success")])
    logger.info(
        f"그룹 실행 완료: {group['name']} "
        f"(성공: {success_count}/{len(results)})"
    )

    return {
        "success": True,
        "executed": len(results),
        "success_count": success_count,
        "results": results,
    }


async def stop_all_tasks() -> int:
    """실행 중인 모든 작업 중지 요청"""
    count = 0

    # 실행 중인 그룹에 중지 요청
    for task_id in list(running_tasks.keys()):
        stop_requested.add(task_id)
        count += 1

    logger.info(f"전체 작업 중지 요청: {count}개")
    return count
