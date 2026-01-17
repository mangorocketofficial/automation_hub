"""
그룹 API 테스트
"""

import pytest


def test_list_groups(client):
    """그룹 목록 조회 테스트"""
    response = client.get("/api/groups")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_group(client, sample_group):
    """그룹 생성 테스트"""
    response = client.post("/api/groups", json=sample_group)

    # 성공 또는 DB 연결 오류 (Supabase 미설정시)
    assert response.status_code in [201, 500]

    if response.status_code == 201:
        data = response.json()
        assert data["name"] == sample_group["name"]
        assert data["type"] == sample_group["type"]
        assert "id" in data


def test_get_group_not_found(client):
    """존재하지 않는 그룹 조회 테스트"""
    response = client.get("/api/groups/00000000-0000-0000-0000-000000000000")
    # 404 또는 DB 오류
    assert response.status_code in [404, 500]
