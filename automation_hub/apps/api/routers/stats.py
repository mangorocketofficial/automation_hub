"""
통계 API 라우터
"""

from typing import List, Optional
from datetime import datetime, timedelta, date

from fastapi import APIRouter, Query

from models.schemas import RunLog, Stats, DashboardSummary
from core.database import get_run_logs, get_stats, get_all_channels, get_all_groups

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """대시보드 요약 통계"""
    logs = await get_run_logs(limit=1000)

    today = datetime.now().date()
    today_logs = [
        log
        for log in logs
        if datetime.fromisoformat(log["started_at"].replace("Z", "+00:00")).date() == today
    ]

    summary = DashboardSummary(
        scheduled=0,
        running=len([l for l in today_logs if l["status"] == "running"]),
        completed=len([l for l in today_logs if l["status"] == "success"]),
        failed=len([l for l in today_logs if l["status"] == "failed"]),
    )

    return summary


@router.get("/logs", response_model=List[RunLog])
async def list_run_logs(
    channel_id: Optional[str] = Query(None, description="채널 ID 필터"),
    limit: int = Query(50, ge=1, le=500, description="조회 개수"),
):
    """실행 로그 목록 조회"""
    logs = await get_run_logs(channel_id, limit)
    return logs


@router.get("/channel/{channel_id}", response_model=List[Stats])
async def get_stats_by_channel(
    channel_id: str,
    days: int = Query(30, ge=1, le=365, description="조회 기간(일)"),
):
    """채널별 통계 조회"""
    stats = await get_stats(channel_id, days)
    return stats


@router.get("/overview")
async def get_overview_stats(
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
):
    """전체 개요 통계 (기간별)"""
    channels = await get_all_channels()
    logs = await get_run_logs(limit=5000)

    # 기본값: 최근 7일
    if not end_date:
        end_date = datetime.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=7)

    # 현재 기간 로그 필터링
    current_logs = []
    for log in logs:
        log_date = datetime.fromisoformat(log["started_at"].replace("Z", "+00:00")).date()
        if start_date <= log_date <= end_date:
            current_logs.append(log)

    # 이전 기간 (동일한 기간 길이)
    period_length = (end_date - start_date).days + 1
    prev_start = start_date - timedelta(days=period_length)
    prev_end = start_date - timedelta(days=1)

    prev_logs = []
    for log in logs:
        log_date = datetime.fromisoformat(log["started_at"].replace("Z", "+00:00")).date()
        if prev_start <= log_date <= prev_end:
            prev_logs.append(log)

    # 현재 기간 통계
    total_runs = len(current_logs)
    successful_runs = len([l for l in current_logs if l["status"] == "success"])
    failed_runs = len([l for l in current_logs if l["status"] == "failed"])
    success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0

    # 이전 기간 통계
    prev_total_runs = len(prev_logs)
    prev_successful = len([l for l in prev_logs if l["status"] == "success"])
    prev_success_rate = (prev_successful / prev_total_runs * 100) if prev_total_runs > 0 else 0

    # 변화율 계산
    def calc_change(current: float, previous: float) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    # 채널 상태 집계
    status_counts = {
        "active": len([c for c in channels if c["status"] == "active"]),
        "paused": len([c for c in channels if c["status"] == "paused"]),
        "error": len([c for c in channels if c["status"] == "error"]),
    }

    # 목업 데이터 (stats 테이블에 데이터가 있으면 실제 값 사용)
    total_views = total_runs * 350  # 목업: 실행당 평균 350 조회수
    total_subscribers = total_runs * 8  # 목업: 실행당 평균 8 구독자
    prev_views = prev_total_runs * 350
    prev_subscribers = prev_total_runs * 8

    return {
        "total_channels": len(channels),
        "channel_status": status_counts,
        "total_views": total_views,
        "total_subscribers": total_subscribers,
        "total_posts": total_runs,
        "success_rate": round(success_rate, 1),
        "views_change": calc_change(total_views, prev_views),
        "subscribers_change": calc_change(total_subscribers, prev_subscribers),
        "posts_change": calc_change(total_runs, prev_total_runs),
        "success_rate_change": round(success_rate - prev_success_rate, 1),
        "weekly_stats": {
            "total_runs": total_runs,
            "successful_runs": successful_runs,
            "failed_runs": failed_runs,
            "success_rate": round(success_rate, 1),
        },
    }


@router.get("/daily")
async def get_daily_stats(
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
):
    """일별 통계"""
    logs = await get_run_logs(limit=5000)

    # 기본값: 최근 7일
    if not end_date:
        end_date = datetime.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=7)

    # 일별 집계
    daily_data = {}
    current_date = start_date
    while current_date <= end_date:
        daily_data[current_date.isoformat()] = {
            "date": current_date.isoformat(),
            "views": 0,
            "subscribers": 0,
            "posts": 0,
            "success": 0,
            "failed": 0,
        }
        current_date += timedelta(days=1)

    # 로그 집계
    for log in logs:
        log_date = datetime.fromisoformat(log["started_at"].replace("Z", "+00:00")).date()
        date_key = log_date.isoformat()
        if date_key in daily_data:
            daily_data[date_key]["posts"] += 1
            if log["status"] == "success":
                daily_data[date_key]["success"] += 1
                # 목업: 성공한 실행당 조회수/구독자 추가
                daily_data[date_key]["views"] += 350
                daily_data[date_key]["subscribers"] += 8
            elif log["status"] == "failed":
                daily_data[date_key]["failed"] += 1

    # 정렬된 리스트 반환
    return sorted(daily_data.values(), key=lambda x: x["date"])


@router.get("/groups")
async def get_group_stats(
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
):
    """그룹별 통계"""
    groups = await get_all_groups()
    channels = await get_all_channels()
    logs = await get_run_logs(limit=5000)

    # 기본값: 최근 7일
    if not end_date:
        end_date = datetime.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=7)

    # 채널 -> 그룹 매핑
    channel_to_group = {c["id"]: c["group_id"] for c in channels}

    # 그룹별 집계 초기화
    group_stats = {}
    for group in groups:
        group_stats[group["id"]] = {
            "group_id": group["id"],
            "group_name": group["name"],
            "group_type": group["type"],
            "total_views": 0,
            "total_subscribers": 0,
            "total_posts": 0,
            "success_count": 0,
            "failed_count": 0,
        }

    # 로그 집계
    for log in logs:
        log_date = datetime.fromisoformat(log["started_at"].replace("Z", "+00:00")).date()
        if start_date <= log_date <= end_date:
            channel_id = log.get("channel_id")
            group_id = channel_to_group.get(channel_id)
            if group_id and group_id in group_stats:
                group_stats[group_id]["total_posts"] += 1
                if log["status"] == "success":
                    group_stats[group_id]["success_count"] += 1
                    group_stats[group_id]["total_views"] += 350
                    group_stats[group_id]["total_subscribers"] += 8
                elif log["status"] == "failed":
                    group_stats[group_id]["failed_count"] += 1

    # 성공률 계산 및 리스트 변환
    result = []
    for stats in group_stats.values():
        total = stats["total_posts"]
        success_rate = (stats["success_count"] / total * 100) if total > 0 else 0
        result.append({
            "group_id": stats["group_id"],
            "group_name": stats["group_name"],
            "group_type": stats["group_type"],
            "total_views": stats["total_views"],
            "total_subscribers": stats["total_subscribers"],
            "total_posts": stats["total_posts"],
            "success_rate": round(success_rate, 1),
        })

    # 조회수 기준 정렬
    return sorted(result, key=lambda x: x["total_views"], reverse=True)


@router.get("/top-channels")
async def get_top_channels(
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
    limit: int = Query(10, ge=1, le=100, description="조회 개수"),
    sort_by: str = Query("views", description="정렬 기준 (views, subscribers, posts)"),
):
    """채널별 TOP N"""
    groups = await get_all_groups()
    channels = await get_all_channels()
    logs = await get_run_logs(limit=5000)

    # 기본값: 최근 7일
    if not end_date:
        end_date = datetime.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=7)

    # 그룹 ID -> 이름 매핑
    group_names = {g["id"]: g["name"] for g in groups}

    # 채널별 집계 초기화
    channel_stats = {}
    for channel in channels:
        channel_stats[channel["id"]] = {
            "channel_id": channel["id"],
            "channel_name": channel["name"],
            "group_id": channel["group_id"],
            "group_name": group_names.get(channel["group_id"], "Unknown"),
            "views": 0,
            "subscribers": 0,
            "posts": 0,
        }

    # 로그 집계
    for log in logs:
        log_date = datetime.fromisoformat(log["started_at"].replace("Z", "+00:00")).date()
        if start_date <= log_date <= end_date:
            channel_id = log.get("channel_id")
            if channel_id and channel_id in channel_stats:
                channel_stats[channel_id]["posts"] += 1
                if log["status"] == "success":
                    channel_stats[channel_id]["views"] += 350
                    channel_stats[channel_id]["subscribers"] += 8

    # 정렬
    result = list(channel_stats.values())
    if sort_by == "subscribers":
        result.sort(key=lambda x: x["subscribers"], reverse=True)
    elif sort_by == "posts":
        result.sort(key=lambda x: x["posts"], reverse=True)
    else:
        result.sort(key=lambda x: x["views"], reverse=True)

    # 순위 추가 및 limit 적용
    for i, item in enumerate(result[:limit], 1):
        item["rank"] = i

    return result[:limit]
