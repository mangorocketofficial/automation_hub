'use client';

import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { PipelineStage, PipelineStatus } from '@/types/analysis';
import { PIPELINE_STAGE_LABELS, PIPELINE_STATUS_LABELS } from '@/types/analysis';

interface PipelineProgressProps {
  status: PipelineStatus;
  stage: PipelineStage;
  progress: number;
  startedAt: string | null;
  isLoading: boolean;
}

const STAGE_ORDER: PipelineStage[] = [
  'collection',
  'scoring',
  'analysis',
  'script_generation',
  'media_generation',
  'completed',
];

const STAGE_ICONS: Record<PipelineStage, string> = {
  idle: '⏸️',
  collection: '📹',
  scoring: '📊',
  analysis: '🔍',
  script_generation: '✍️',
  media_generation: '🎬',
  completed: '✅',
  failed: '❌',
};

export default function PipelineProgress({
  status,
  stage,
  progress,
  startedAt,
  isLoading,
}: PipelineProgressProps) {
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  const getElapsedTime = () => {
    if (!startedAt) return null;
    const start = new Date(startedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}분 ${seconds}초`;
  };

  const currentStageIndex = STAGE_ORDER.indexOf(stage);

  if (!isRunning && !isCompleted && !isFailed) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{STAGE_ICONS[stage]}</span>
        <h3 className="text-lg font-semibold text-zinc-100">실행 진행 상황</h3>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">
            {PIPELINE_STATUS_LABELS[status]}
          </span>
          <span className="text-sm text-zinc-300">{progress}%</span>
        </div>
        <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isCompleted && 'bg-green-500',
              isFailed && 'bg-red-500',
              isRunning && 'bg-blue-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage indicators */}
      <div className="space-y-2">
        {STAGE_ORDER.slice(0, -1).map((s, idx) => {
          const isActive = s === stage;
          const isStageCompleted = idx < currentStageIndex || status === 'completed';
          const isStageFailed = s === stage && status === 'failed';

          return (
            <div
              key={s}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                isActive && 'bg-blue-500/10',
                isStageCompleted && !isActive && 'opacity-60'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  isStageCompleted && 'bg-green-500 text-white',
                  isActive && !isStageFailed && 'bg-blue-500 text-white animate-pulse',
                  isStageFailed && 'bg-red-500 text-white',
                  !isStageCompleted && !isActive && 'bg-zinc-700 text-zinc-400'
                )}
              >
                {isStageCompleted ? '✓' : isStageFailed ? '✕' : idx + 1}
              </div>
              <div className="flex-1">
                <div
                  className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-zinc-100' : 'text-zinc-400'
                  )}
                >
                  {PIPELINE_STAGE_LABELS[s]}
                </div>
              </div>
              {isActive && isRunning && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Elapsed time */}
      {startedAt && (
        <div className="mt-4 pt-4 border-t border-zinc-700 text-sm text-zinc-400">
          경과 시간: {getElapsedTime()}
        </div>
      )}
    </Card>
  );
}
