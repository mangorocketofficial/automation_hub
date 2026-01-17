"""
채널 API 테스트
"""

import pytest


def test_list_channels(client):
    """채널 목록 조회 테스트"""
    response = client.get("/api/channels")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_channels_with_group_filter(client):
    """그룹 필터로 채널 목록 조회 테스트"""
    group_id = "11111111-1111-1111-1111-111111111111"
    response = client.get(f"/api/channels?group_id={group_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_channel_not_found(client):
    """존재하지 않는 채널 조회 테스트"""
    response = client.get("/api/channels/00000000-0000-0000-0000-000000000000")
    assert response.status_code in [404, 500]
