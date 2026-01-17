'use client';

import Card from '@/components/ui/Card';
import type { KpiData } from '@/types/analysis';

interface KpiCardsProps {
  data: KpiData | null;
  isLoading: boolean;
  lastUpdated?: string;
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <div className="bg-zinc-700/50 rounded-lg p-4 flex flex-col items-center">
      <span className="text-2xl mb-1">{icon}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-zinc-400 mt-1">{title}</span>
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="bg-zinc-700/50 rounded-lg p-4 flex flex-col items-center animate-pulse">
      <div className="h-8 w-8 bg-zinc-600 rounded mb-1" />
      <div className="h-8 w-16 bg-zinc-600 rounded mb-1" />
      <div className="h-4 w-20 bg-zinc-600 rounded mt-1" />
    </div>
  );
}

export default function KpiCards({ data, isLoading, lastUpdated }: KpiCardsProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-lg font-semibold text-zinc-100">KPI 요약</h3>
        </div>
        {lastUpdated && (
          <span className="text-xs text-zinc-500">마지막: {lastUpdated}</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : data ? (
          <>
            <KpiCard
              title="생성 콘텐츠"
              value={data.total_generated}
              icon="📝"
              color="text-blue-400"
            />
            <KpiCard
              title="승인 대기"
              value={data.pending_review}
              icon="⏳"
              color="text-yellow-400"
            />
            <KpiCard
              title="업로드 완료"
              value={data.total_uploaded}
              icon="✅"
              color="text-green-400"
            />
            <KpiCard
              title="실패"
              value={data.total_failed}
              icon="❌"
              color="text-red-400"
            />
          </>
        ) : (
          <div className="col-span-4 text-center text-zinc-500 py-4">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Card>
  );
}
