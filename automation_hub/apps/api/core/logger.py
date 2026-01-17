"""
로깅 설정
"""

import logging
import sys
from core.config import settings


def setup_logger(name: str) -> logging.Logger:
    """로거 설정 및 반환"""
    logger = logging.getLogger(name)

    # 이미 핸들러가 있으면 스킵
    if logger.handlers:
        return logger

    # 로그 레벨 설정
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logger.setLevel(log_level)

    # 콘솔 핸들러
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # 포맷 설정
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger


# 기본 로거
default_logger = setup_logger("automation-hub")
