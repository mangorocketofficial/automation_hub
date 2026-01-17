"""
헬스 체크 API 테스트
"""

import pytest


def test_root(client):
    """루트 엔드포인트 테스트"""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert "message" in data


def test_health_check(client):
    """헬스 체크 엔드포인트 테스트"""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "scheduler_running" in data
    assert "jobs_count" in data
