'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type {
  PipelineMode,
  PipelineStatus,
  PipelineStage,
} from '@/types/analysis';
import {
  PIPELINE_MODE_LABELS,
  PIPELINE_STATUS_LABELS,
  PIPELINE_STAGE_LABELS,
} from '@/types/analysis';

interface PipelineControlProps {
  category: string;
  status: PipelineStatus;
  stage: PipelineStage;
  progress: number;
  isLoading: boolean;
  onExecute: (mode: PipelineMode) => void;
  onStop: () => void;
}

export default function PipelineControl({
  category,
  status,
  stage,
  progress,
  isLoading,
  onExecute,
  onStop,
}: PipelineControlProps) {
  const [selectedMode, setSelectedMode] = useState<PipelineMode>('full');
  const [showModeSelect, setShowModeSelect] = useState(false);

  const isRunning = status === 'running';
  const isIdle = status === 'idle';

  const statusColors: Record<PipelineStatus, string> = {
    idle: 'text-zinc-400',
    running: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    stopped: 'text-yellow-400',
  };

  const handleExecute = () => {
    onExecute(selectedMode);
    setShowModeSelect(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">파이프라인 실행</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className={statusColors[status]}>
                {PIPELINE_STATUS_LABELS[status]}
              </span>
              {isRunning && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">
                    {PIPELINE_STAGE_LABELS[stage]}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress indicator when running */}
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-zinc-400">{progress}%</span>
            </div>
          )}

          {/* Mode selector */}
          {isIdle && (
            <div className="relative">
              <button
                onClick={() => setShowModeSelect(!showModeSelect)}
                className="px-3 py-2 text-sm bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                {PIPELINE_MODE_LABELS[selectedMode]}
                <span className="ml-2">▼</span>
              </button>

              {showModeSelect && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                  {(Object.entries(PIPELINE_MODE_LABELS) as [PipelineMode, string][]).map(
                    ([mode, label]) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setSelectedMode(mode);
                          setShowModeSelect(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors',
                          selectedMode === mode
                            ? 'text-purple-400 bg-zinc-700/50'
                            : 'text-zinc-300'
                        )}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Execute/Stop button */}
          {isRunning ? (
            <button
              onClick={onStop}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'bg-red-600 text-white hover:bg-red-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? '중지 중...' : '중지'}
            </button>
          ) : (
            <button
              onClick={handleExecute}
              disabled={isLoading || !isIdle}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'bg-purple-600 text-white hover:bg-purple-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? '실행 중...' : '실행'}
            </button>
          )}
        </div>
      </div>

      {/* Stage progress dots */}
      {isRunning && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <div className="flex items-center justify-between">
            {(['collection', 'scoring', 'analysis', 'script_generation', 'media_generation'] as PipelineStage[]).map(
              (s, idx) => {
                const stageOrder = ['collection', 'scoring', 'analysis', 'script_generation', 'media_generation'];
                const currentIdx = stageOrder.indexOf(stage);
                const thisIdx = idx;
                const isActive = thisIdx === currentIdx;
                const isCompleted = thisIdx < currentIdx;

                return (
                  <div key={s} className="flex items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                        isCompleted && 'bg-green-500 text-white',
                        isActive && 'bg-blue-500 text-white animate-pulse',
                        !isCompleted && !isActive && 'bg-zinc-700 text-zinc-400'
                      )}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    {idx < 4 && (
                      <div
                        className={cn(
                          'w-12 h-0.5 mx-1',
                          isCompleted ? 'bg-green-500' : 'bg-zinc-700'
                        )}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>수집</span>
            <span>스코어링</span>
            <span>분석</span>
            <span>스크립트</span>
            <span>미디어</span>
          </div>
        </div>
      )}
    </Card>
  );
}
