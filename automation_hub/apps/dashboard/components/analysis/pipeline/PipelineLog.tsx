'use client';

import { useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { PipelineLogEntry } from '@/types/analysis';
import { PIPELINE_STAGE_LABELS } from '@/types/analysis';

interface PipelineLogProps {
  logs: PipelineLogEntry[];
  isLoading: boolean;
  autoScroll?: boolean;
}

const LOG_LEVEL_STYLES: Record<PipelineLogEntry['level'], { icon: string; color: string }> = {
  info: { icon: 'ℹ️', color: 'text-blue-400' },
  warning: { icon: '⚠️', color: 'text-yellow-400' },
  error: { icon: '❌', color: 'text-red-400' },
  success: { icon: '✅', color: 'text-green-400' },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function PipelineLog({
  logs,
  isLoading,
  autoScroll = true,
}: PipelineLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (logs.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-lg font-semibold text-zinc-100">실행 로그</h3>
        </div>
        <span className="text-xs text-zinc-500">{logs.length}개 항목</span>
      </div>

      <div
        ref={logContainerRef}
        className="h-64 overflow-y-auto bg-zinc-950 rounded-lg p-3 font-mono text-xs space-y-1"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-500 text-center py-8">
            로그가 없습니다
          </div>
        ) : (
          logs.map((log, idx) => {
            const style = LOG_LEVEL_STYLES[log.level];
            return (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-2 py-1 px-2 rounded hover:bg-zinc-900/50',
                  log.level === 'error' && 'bg-red-500/10'
                )}
              >
                <span className="text-zinc-500 shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                <span className="shrink-0">{style.icon}</span>
                <span className="text-zinc-500 shrink-0">
                  [{PIPELINE_STAGE_LABELS[log.stage]}]
                </span>
                <span className={cn('flex-1', style.color)}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-500 py-1 px-2">
            <span className="animate-pulse">▍</span>
            <span>실행 중...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
