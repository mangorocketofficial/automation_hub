# 1) 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일만 먼저 복사 (캐시 활용)
COPY package*.json ./

# 필요한 모든 의존성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

ARG NEXT_PUBLIC_VPS_API_URL
ARG NEXT_PUBLIC_ANALYSIS_API_URL

ENV NEXT_PUBLIC_VPS_API_URL=$NEXT_PUBLIC_VPS_API_URL
ENV NEXT_PUBLIC_ANALYSIS_API_URL=$NEXT_PUBLIC_ANALYSIS_API_URL



# Next.js 빌드 시 메모리 제한 (VPS 보호)
ENV NODE_OPTIONS="--max-old-space-size=1024"

# 반드시 next.config.js 에서 output: 'standalone' 이 설정되어 있어야 합니다.
RUN npm run build

# 2) 런타임 스테이지
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Next.js standalone 빌드 결과만 복사 (용량 최소화)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 컨테이너에서 오픈할 포트
EXPOSE 3000

# standalone 모드의 엔트리포인트 (server.js)
CMD ["node", "server.js"]
