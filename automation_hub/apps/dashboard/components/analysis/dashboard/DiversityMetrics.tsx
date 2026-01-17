'use client';

import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { DiversityMetrics as DiversityMetricsType } from '@/types/analysis';

interface DiversityMetricsProps {
  data: DiversityMetricsType | null;
  isLoading: boolean;
}

interface DiversityBarProps {
  label: string;
  dominance: number;
  threshold?: number;
}

function DiversityBar({ label, dominance, threshold = 40 }: DiversityBarProps) {
  const safeValue = dominance ?? 0;
  const isWarning = safeValue > threshold;
  const percentage = Math.min(safeValue, 100);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className={cn('text-sm font-medium', isWarning ? 'text-yellow-400' : 'text-zinc-400')}>
          {safeValue.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isWarning ? 'bg-yellow-500' : 'bg-emerald-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs">
        {isWarning ? (
          <span className="text-yellow-400">⚠️ 편중 경고</span>
        ) : (
          <span className="text-green-400">✅ 정상</span>
        )}
      </div>
    </div>
  );
}

function DiversityBarSkeleton() {
  return (
    <div className="flex-1 animate-pulse">
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 w-20 bg-zinc-600 rounded" />
        <div className="h-4 w-10 bg-zinc-600 rounded" />
      </div>
      <div className="h-2 bg-zinc-700 rounded-full" />
      <div className="mt-1">
        <div className="h-3 w-16 bg-zinc-600 rounded" />
      </div>
    </div>
  );
}

export default function DiversityMetrics({ data, isLoading }: DiversityMetricsProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚖️</span>
        <h3 className="text-lg font-semibold text-zinc-100">다양성 지표</h3>
      </div>

      <div className="flex gap-6">
        {isLoading ? (
          <>
            <DiversityBarSkeleton />
            <DiversityBarSkeleton />
            <DiversityBarSkeleton />
          </>
        ) : data ? (
          <>
            <DiversityBar label="Structure 분포" dominance={data.structure_dominance ?? 0} />
            <DiversityBar label="Hook 분포" dominance={data.hook_dominance ?? 0} />
            <DiversityBar label="Title 분포" dominance={data.title_dominance ?? 0} />
          </>
        ) : (
          <div className="w-full text-center text-zinc-500 py-4">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>

      {data?.alerts && data.alerts.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="text-sm text-yellow-400">
            {data.alerts.map((alert, idx) => (
              <div key={idx}>⚠️ {alert}</div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
