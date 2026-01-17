"""
환경변수 설정 관리
pydantic-settings를 사용한 타입 안전한 설정 관리
"""

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


# 프로젝트 루트 경로 (apps/api 기준으로 2단계 상위)
API_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = API_DIR.parent.parent


class Settings(BaseSettings):
    """애플리케이션 설정"""

    model_config = SettingsConfigDict(
        env_file=[ROOT_DIR / ".env", API_DIR / ".env"],  # 루트와 api 폴더 모두 확인
        env_file_encoding="utf-8",
        extra="ignore",  # 알 수 없는 필드 무시
    )

    # 기본 설정
    debug: bool = False
    log_level: str = "INFO"

    # Supabase 설정 (SERVICE_KEY 사용)
    supabase_url: str = ""
    supabase_service_key: str = ""  # SUPABASE_SERVICE_KEY 환경변수와 매핑

    # CORS 설정
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:8001"

    # OpenAI 설정
    openai_api_key: str = ""

    # YouTube 설정
    youtube_api_key: str = ""

    @property
    def supabase_key(self) -> str:
        """Supabase 키 (service_key 사용)"""
        return self.supabase_service_key

    @property
    def cors_origins_list(self) -> List[str]:
        """CORS 허용 도메인 리스트"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """설정 인스턴스 반환 (캐시됨)"""
    return Settings()


# 전역 설정 인스턴스
settings = get_settings()
