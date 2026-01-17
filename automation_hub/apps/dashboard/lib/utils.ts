import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 채널 타입 라벨
export const CHANNEL_TYPE_LABELS: Record<string, string> = {
  youtube_shorts: '유튜브 쇼츠',
  naver_blog: '네이버 블로그',
  nextjs_blog: 'Next.js 블로그',
};

// 날짜 포맷팅
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// 상대 시간 포맷팅 (예: 5분 전)
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  }
}

// 숫자 포맷팅 (예: 1,234)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

// 초를 시간 문자열로 변환 (예: 1h 23m 45s)
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

// Cron 표현식을 한글로 변환
export function cronToKorean(cron: string): string {
  // TODO: 더 정교한 cron 파싱 구현
  const parts = cron.split(' ');
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // 간단한 케이스만 처리
  if (dayOfMonth === '*' && month === '*') {
    if (dayOfWeek === '*') {
      return `매일 ${hour}:${minute.padStart(2, '0')}`;
    }
  }

  return cron;
}

// 큰 숫자 포맷 (1234 -> 1,234 / 12345 -> 12.3K)
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// 변화율 포맷 (+12.3% / -5.2%)
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

// 차트용 짧은 날짜 포맷 (1/15)
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 긴 날짜 포맷 (1월 15일)
export function formatLongDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// API 날짜 파라미터 포맷 (YYYY-MM-DD)
export function formatApiDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
