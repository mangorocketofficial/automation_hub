'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { ENTITY_TYPE_LABELS, type FailureMonitoringData, type FailureEvent } from '@/types/analysis';

interface FailureEventsProps {
  data: FailureMonitoringData | null;
  isLoading: boolean;
  category: string;
}

interface FailureRowProps {
  failure: FailureEvent;
}

function FailureRow({ failure }: FailureRowProps) {
  const time = new Date(failure.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <tr className="border-b border-zinc-700/50 last:border-0">
      <td className="py-2 px-3 text-sm text-zinc-400">{time}</td>
      <td className="py-2 px-3 text-sm text-zinc-300">
        {ENTITY_TYPE_LABELS[failure.entity_type] || failure.entity_type}
      </td>
      <td className="py-2 px-3 text-sm text-zinc-200 font-medium">{failure.entity_key}</td>
      <td className="py-2 px-3 text-sm text-red-400">{failure.failure_type}</td>
    </tr>
  );
}

function FailureRowSkeleton() {
  return (
    <tr className="border-b border-zinc-700/50 animate-pulse">
      <td className="py-2 px-3"><div className="h-4 w-12 bg-zinc-600 rounded" /></td>
      <td className="py-2 px-3"><div className="h-4 w-16 bg-zinc-600 rounded" /></td>
      <td className="py-2 px-3"><div className="h-4 w-20 bg-zinc-600 rounded" /></td>
      <td className="py-2 px-3"><div className="h-4 w-24 bg-zinc-600 rounded" /></td>
    </tr>
  );
}

export default function FailureEvents({ data, isLoading, category }: FailureEventsProps) {
  const recentFailures = data?.recent_failures?.slice(0, 5) || [];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">❌</span>
          <h3 className="text-lg font-semibold text-zinc-100">최근 실패 이벤트</h3>
          {data && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
              24h: {data.total_failures_24h}건
            </span>
          )}
        </div>
        <Link
          href={`/analysis/structures?category=${category}&tab=penalties`}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          전체보기 →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-700">
              <th className="py-2 px-3 font-medium">시간</th>
              <th className="py-2 px-3 font-medium">타입</th>
              <th className="py-2 px-3 font-medium">엔티티</th>
              <th className="py-2 px-3 font-medium">사유</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <FailureRowSkeleton />
                <FailureRowSkeleton />
                <FailureRowSkeleton />
              </>
            ) : recentFailures.length > 0 ? (
              recentFailures.map((failure) => (
                <FailureRow key={failure.id} failure={failure} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500">
                  최근 24시간 내 실패 이벤트가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
