'use client';

import Card from '@/components/ui/Card';
import type { SafetyStatus as SafetyStatusType } from '@/types/analysis';

interface SafetyStatusProps {
  status: SafetyStatusType | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function SafetyStatus({ status, isLoading, onRefresh }: SafetyStatusProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h3 className="text-lg font-semibold text-zinc-100">안전 규칙</h3>
        </div>
        <button
          onClick={onRefresh}
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-zinc-600 rounded mb-2" />
          <div className="h-4 w-32 bg-zinc-600 rounded" />
        </div>
      ) : status ? (
        <div>
          {status.all_rules_passed ? (
            <div className="flex items-center gap-2 text-green-400">
              <span className="text-xl">✅</span>
              <span>모든 안전 규칙 준수 중</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-xl">⚠️</span>
                <span>안전 규칙 위반 감지</span>
              </div>
              {status.violations.length > 0 && (
                <ul className="text-sm text-red-400 ml-8 space-y-1">
                  {status.violations.map((violation, idx) => (
                    <li key={idx}>• {violation}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-4 text-xs text-zinc-500 space-y-1">
            <div>7일 승인 영상: {status.approved_videos_7d}개</div>
            <div>현재 오류율: {(status.current_error_rate * 100).toFixed(1)}%</div>
            <div>
              마지막 체크:{' '}
              {new Date(status.last_checked).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-zinc-500 py-4">안전 상태를 확인할 수 없습니다</div>
      )}
    </Card>
  );
}
