'use client';

import Card from '@/components/ui/Card';
import type { GovernanceConfig } from '@/types/analysis';

interface WeightBlendingProps {
  config: GovernanceConfig | null;
  isLoading: boolean;
  onChange: (key: keyof GovernanceConfig, value: number) => void;
}

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function WeightSlider({ label, value, onChange, disabled }: WeightSliderProps) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-sm font-mono text-emerald-400">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-emerald-500
          [&::-webkit-slider-thumb]:cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function WeightSliderSkeleton() {
  return (
    <div className="py-3 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-28 bg-zinc-600 rounded" />
        <div className="h-4 w-10 bg-zinc-600 rounded" />
      </div>
      <div className="h-2 w-full bg-zinc-600 rounded" />
    </div>
  );
}

export default function WeightBlending({ config, isLoading, onChange }: WeightBlendingProps) {
  const WEIGHTS: { key: keyof GovernanceConfig; label: string }[] = [
    { key: 'autonomous_viral_base_weight', label: 'Viral Base Weight' },
    { key: 'autonomous_perf_blend_ratio', label: 'Performance Blend' },
    { key: 'autonomous_penalty_blend_ratio', label: 'Penalty Blend' },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚡</span>
        <h3 className="text-lg font-semibold text-zinc-100">가중치 블렌딩</h3>
      </div>

      <div>
        {isLoading ? (
          <>
            <WeightSliderSkeleton />
            <WeightSliderSkeleton />
            <WeightSliderSkeleton />
          </>
        ) : config ? (
          WEIGHTS.map((weight) => (
            <WeightSlider
              key={weight.key}
              label={weight.label}
              value={config[weight.key] as number}
              onChange={(value) => onChange(weight.key, value)}
            />
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">설정을 불러올 수 없습니다</div>
        )}
      </div>
    </Card>
  );
}
