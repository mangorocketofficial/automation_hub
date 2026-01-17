FROM python:3.12-slim

WORKDIR /app

# 로그 버퍼링 방지, pyc 생성 방지
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL


# 의존성 먼저 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 소스 코드 복사
COPY . .

# API 포트 노출
EXPOSE 8000

# FastAPI 앱 실행
# main.py 안에 app = FastAPI() 가 있다고 가정
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

