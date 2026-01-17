/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 배포를 위한 standalone 출력
  output: 'standalone',

  // 실험적 기능
  experimental: {
    // 필요시 추가
  },

  // 환경변수 검증
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_VPS_API_URL: process.env.NEXT_PUBLIC_VPS_API_URL,
  },

  // 이미지 도메인 허용 (필요시)
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
