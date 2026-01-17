"""
통계 API 테스트
"""

import pytest


def test_dashboard_summary(client):
    """대시보드 요약 통계 테스트"""
    response = client.get("/api/stats/summary")
    assert response.status_code == 200

    data = response.json()
    assert "scheduled" in data
    assert "running" in data
    assert "completed" in data
    assert "failed" in data


def test_run_logs(client):
    """실행 로그 조회 테스트"""
    response = client.get("/api/stats/logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_run_logs_with_limit(client):
    """실행 로그 조회 (limit) 테스트"""
    response = client.get("/api/stats/logs?limit=10")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 10


def test_overview_stats(client):
    """전체 개요 통계 테스트"""
    response = client.get("/api/stats/overview")
    assert response.status_code == 200

    data = response.json()
    assert "total_channels" in data
    assert "channel_status" in data
    assert "weekly_stats" in data
