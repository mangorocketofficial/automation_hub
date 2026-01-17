import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드용 클라이언트 (service role key 사용)
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(supabaseUrl, serviceKey);
};
