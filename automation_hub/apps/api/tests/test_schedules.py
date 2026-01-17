"""
스케줄 API 테스트
"""

import pytest


def test_list_schedules(client):
    """스케줄 목록 조회 테스트"""
    response = client.get("/api/schedules")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_schedule_invalid_target(client, sample_schedule):
    """존재하지 않는 대상으로 스케줄 생성 테스트"""
    # 존재하지 않는 그룹 ID로 생성 시도
    sample_schedule["target_id"] = "00000000-0000-0000-0000-000000000000"
    response = client.post("/api/schedules", json=sample_schedule)

    # 404 (그룹 없음) 또는 500 (DB 오류)
    assert response.status_code in [404, 500]


def test_get_schedule_not_found(client):
    """존재하지 않는 스케줄 조회 테스트"""
    response = client.get("/api/schedules/00000000-0000-0000-0000-000000000000")
    assert response.status_code in [404, 500]


def test_sync_schedules(client):
    """스케줄 동기화 테스트"""
    response = client.post("/api/schedules/sync")
    assert response.status_code == 200

    data = response.json()
    assert "message" in data


def test_get_scheduler_jobs(client):
    """스케줄러 Job 상태 조회 테스트"""
    response = client.get("/api/schedules/status/jobs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
