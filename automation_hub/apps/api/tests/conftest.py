"""
Pytest 설정 및 공통 Fixture
"""

import os
import sys

# .env 파일 로드 (main import 전에 실행되어야 함)
from dotenv import load_dotenv
load_dotenv()

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from main import app


@pytest.fixture
def client():
    """동기 테스트 클라이언트"""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """비동기 테스트 클라이언트"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_group():
    """샘플 그룹 데이터"""
    return {
        "name": "테스트 그룹",
        "type": "youtube_shorts",
        "description": "테스트용 그룹입니다",
        "schedule_cron": "0 9 * * *",
        "is_active": True,
    }


@pytest.fixture
def sample_channel():
    """샘플 채널 데이터"""
    return {
        "name": "테스트 채널",
        "type": "youtube_shorts",
        "config": {"youtube_channel_id": "UCtest123", "content_topic": "test"},
    }


@pytest.fixture
def sample_schedule():
    """샘플 스케줄 데이터"""
    return {
        "target_type": "group",
        "target_id": "11111111-1111-1111-1111-111111111111",
        "cron": "0 10 * * *",
        "is_active": True,
    }
