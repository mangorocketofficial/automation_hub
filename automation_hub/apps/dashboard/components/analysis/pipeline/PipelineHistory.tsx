'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { PipelineHistoryItem } from '@/types/analysis';
import {
  PIPELINE_MODE_LABELS,
  PIPELINE_STATUS_LABELS,
} from '@/types/analysis';

interface PipelineHistoryProps {
  history: PipelineHistoryItem[];
  isLoading: boolean;
  onRefresh?: () => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return minutes > 0 ? `${minutes}분 ${secs}초` : `${secs}초`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PipelineHistory({
  history,
  isLoading,
  onRefresh,
}: PipelineHistoryProps) {
  const router = useRouter();

  const statusStyles: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-green-500/20', text: 'text-green-400' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
    running: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    stopped: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    idle: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
  };

  const handleRowClick = (item: PipelineHistoryItem) => {
    router.push(`/analysis/runs/${item.run_id}?category=${item.category}`);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h3 className="text-lg font-semibold text-zinc-100">실행 이력</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {isLoading ? '새로고침 중...' : '새로고침'}
          </button>
        )}
      </div>

      {isLoading && history.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-zinc-500 py-8">
          실행 이력이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => {
            const style = statusStyles[item.status] || statusStyles.idle;
            return (
              <div
                key={item.run_id}
                onClick={() => handleRowClick(item)}
                className="p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        style.bg,
                        style.text
                      )}
                    >
                      {PIPELINE_STATUS_LABELS[item.status]}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {PIPELINE_MODE_LABELS[item.mode]}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatDate(item.started_at)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <span>
                    수집: <span className="text-zinc-300">{item.videos_collected}</span>개
                  </span>
                  <span>
                    생성: <span className="text-zinc-300">{item.candidates_generated}</span>개
                  </span>
                  <span>
                    소요: <span className="text-zinc-300">{formatDuration(item.duration_seconds)}</span>
                  </span>
                </div>

                {item.error_message && (
                  <div className="mt-2 text-xs text-red-400 truncate">
                    {item.error_message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
