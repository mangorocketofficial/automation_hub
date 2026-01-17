"""
자동화 허브 API 서버
FastAPI를 사용한 중앙 통제 API
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.logger import setup_logger
from services.scheduler import scheduler
from routers import platforms, groups, channels, schedules, run, stats


# 로거 설정
logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 생명주기 관리"""
    # 시작 시
    logger.info("자동화 허브 API 서버 시작")
    scheduler.start()
    logger.info("스케줄러 시작됨")

    yield

    # 종료 시
    scheduler.shutdown()
    logger.info("스케줄러 종료됨")
    logger.info("자동화 허브 API 서버 종료")


# FastAPI 앱 생성
app = FastAPI(
    title="Automation Hub API",
    description="블로그 및 유튜브 채널 자동화 중앙 통제 API",
    version="1.0.0",
    lifespan=lifespan,
)


origins = [
    "http://141.164.58.92:3000",  # 대시보드 공인 IP 주소
    "http://localhost:3000",      # 로컬 테스트용
]

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 라우터 등록
# 데이터 계층 구조: platforms → groups → channels
app.include_router(platforms.router, prefix="/api/platforms", tags=["Platforms"])
app.include_router(groups.router, prefix="/api/groups", tags=["Groups"])
app.include_router(channels.router, prefix="/api/channels", tags=["Channels"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(run.router, prefix="/api", tags=["Run"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])


@app.get("/")
async def root():
    """헬스 체크 엔드포인트"""
    return {
        "status": "ok",
        "message": "Automation Hub API 서버가 실행 중입니다.",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """상세 헬스 체크"""
    return {
        "status": "healthy",
        "scheduler_running": scheduler.running,
        "jobs_count": len(scheduler.get_jobs()),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
