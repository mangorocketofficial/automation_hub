"""
베이스 워커 클래스
모든 자동화 워커의 추상 기본 클래스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any

from core.logger import setup_logger


class BaseWorker(ABC):
    """
    자동화 워커 베이스 클래스

    모든 워커(유튜브, 네이버 블로그, Next.js 블로그)는
    이 클래스를 상속받아 구현해야 합니다.
    """

    def __init__(self, channel: dict):
        """
        워커 초기화

        Args:
            channel: 채널 정보 딕셔너리
        """
        self.channel = channel
        self.channel_id = channel["id"]
        self.channel_name = channel["name"]
        self.channel_type = channel["type"]
        self.config = channel.get("config", {})
        self.logger = setup_logger(f"worker.{self.channel_type}.{self.channel_id}")

        self._is_running = False
        self._should_stop = False

    @abstractmethod
    async def run(self) -> Dict[str, Any]:
        """
        워커 실행

        Returns:
            실행 결과 딕셔너리
        """
        pass

    @abstractmethod
    async def validate_config(self) -> bool:
        """
        설정 유효성 검사

        Returns:
            설정이 유효하면 True
        """
        pass

    def stop(self):
        """워커 중지 요청"""
        self._should_stop = True
        self.logger.info(f"워커 중지 요청: {self.channel_name}")

    def get_status(self) -> Dict[str, Any]:
        """
        워커 상태 반환

        Returns:
            상태 정보 딕셔너리
        """
        return {
            "channel_id": self.channel_id,
            "channel_name": self.channel_name,
            "is_running": self._is_running,
            "should_stop": self._should_stop,
        }

    async def before_run(self):
        """실행 전 준비 작업 (오버라이드 가능)"""
        self._is_running = True
        self._should_stop = False
        self.logger.info(f"워커 시작: {self.channel_name}")

    async def after_run(self, result: Dict[str, Any]):
        """실행 후 정리 작업 (오버라이드 가능)"""
        self._is_running = False
        self.logger.info(f"워커 종료: {self.channel_name}")

    async def on_error(self, error: Exception):
        """에러 발생 시 처리 (오버라이드 가능)"""
        self._is_running = False
        self.logger.error(f"워커 에러: {self.channel_name}, {error}")
