'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PipelineMode } from '@/types/analysis';
import { PIPELINE_MODE_LABELS } from '@/types/analysis';

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: PipelineMode, dryRun: boolean) => void;
  category: string;
  isLoading: boolean;
}

export default function PipelineModal({
  isOpen,
  onClose,
  onConfirm,
  category,
  isLoading,
}: PipelineModalProps) {
  const [selectedMode, setSelectedMode] = useState<PipelineMode>('full');
  const [dryRun, setDryRun] = useState(false);

  if (!isOpen) return null;

  const modeDescriptions: Record<PipelineMode, string> = {
    full: '분석 + 생성을 모두 실행합니다. 바이럴 비디오 수집, 스크립트 분석, 콘텐츠 생성, 미디어 생성까지 전체 파이프라인을 실행합니다.',
    analysis: '바이럴 비디오 수집과 스크립트 분석만 실행합니다. 트렌드 파악에 유용합니다.',
    generation: '기존 분석 결과를 바탕으로 콘텐츠와 미디어 생성만 실행합니다.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100">
            파이프라인 실행 확인
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Category info */}
          <div className="p-3 bg-zinc-800 rounded-lg">
            <span className="text-sm text-zinc-400">카테고리: </span>
            <span className="text-sm font-medium text-zinc-200">{category}</span>
          </div>

          {/* Mode selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">실행 모드</label>
            <div className="space-y-2">
              {(Object.entries(PIPELINE_MODE_LABELS) as [PipelineMode, string][]).map(
                ([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-colors border',
                      selectedMode === mode
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {modeDescriptions[mode]}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Dry run option */}
          <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-500 focus:ring-purple-500"
            />
            <div>
              <div className="text-sm font-medium text-zinc-300">Dry Run 모드</div>
              <div className="text-xs text-zinc-500">
                실제 API 호출 없이 테스트 실행
              </div>
            </div>
          </label>

          {/* Warning */}
          {!dryRun && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-sm text-yellow-400">
                ⚠️ 실제 API가 호출되며 비용이 발생할 수 있습니다.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(selectedMode, dryRun)}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-purple-600 text-white hover:bg-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? '실행 중...' : '실행'}
          </button>
        </div>
      </div>
    </div>
  );
}
