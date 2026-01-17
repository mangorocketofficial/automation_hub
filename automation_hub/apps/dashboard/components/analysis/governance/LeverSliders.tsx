'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import type { GovernanceConfig, GuardrailLimits } from '@/types/analysis';

interface LeverSlidersProps {
  config: GovernanceConfig | null;
  limits: GuardrailLimits | null;
  isLoading: boolean;
  onChange: (key: keyof GovernanceConfig, value: number) => void;
}

interface SliderRowProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: SliderRowProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  const displayValue = unit === '%' ? `${(localValue * 100).toFixed(0)}%` : localValue.toFixed(2);

  return (
    <div className="py-4 border-b border-zinc-700/50 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-zinc-200">{label}</div>
          <div className="text-xs text-zinc-500">{description}</div>
        </div>
        <span className="text-sm font-mono text-emerald-400">{displayValue}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">{unit === '%' ? `${min * 100}%` : min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-emerald-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-emerald-400
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-xs text-zinc-500">{unit === '%' ? `${max * 100}%` : max}</span>
      </div>
    </div>
  );
}

function SliderRowSkeleton() {
  return (
    <div className="py-4 border-b border-zinc-700/50 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="h-4 w-32 bg-zinc-600 rounded mb-1" />
          <div className="h-3 w-48 bg-zinc-600 rounded" />
        </div>
        <div className="h-4 w-12 bg-zinc-600 rounded" />
      </div>
      <div className="h-2 w-full bg-zinc-600 rounded" />
    </div>
  );
}

export default function LeverSliders({ config, limits, isLoading, onChange }: LeverSlidersProps) {
  const defaultLimits: GuardrailLimits = {
    exploration_rate: { min: 0.05, max: 0.25, default: 0.1 },
    diversity_cap_pct: { min: 0.2, max: 0.5, default: 0.4 },
    min_exposure_pct: { min: 0.02, max: 0.1, default: 0.05 },
    penalty_impact_cap_pct: { min: 0.05, max: 0.2, default: 0.15 },
  };

  const getLimits = limits || defaultLimits;

  const SLIDERS: {
    key: keyof GovernanceConfig;
    label: string;
    description: string;
    limitKey: keyof GuardrailLimits;
    unit: string;
  }[] = [
    {
      key: 'exploration_rate',
      label: 'Exploration Rate',
      description: '랜덤 탐색 확률',
      limitKey: 'exploration_rate',
      unit: '%',
    },
    {
      key: 'diversity_cap_pct',
      label: 'Diversity Cap',
      description: '단일 엔티티 최대 점유율',
      limitKey: 'diversity_cap_pct',
      unit: '%',
    },
    {
      key: 'min_exposure_pct',
      label: 'Min Exposure',
      description: '최소 노출 보장',
      limitKey: 'min_exposure_pct',
      unit: '%',
    },
    {
      key: 'penalty_impact_cap_pct',
      label: 'Penalty Impact Cap',
      description: '최대 패널티 감점',
      limitKey: 'penalty_impact_cap_pct',
      unit: '%',
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚖️</span>
        <h3 className="text-lg font-semibold text-zinc-100">탐색/활용 레버</h3>
      </div>

      <div>
        {isLoading ? (
          <>
            <SliderRowSkeleton />
            <SliderRowSkeleton />
            <SliderRowSkeleton />
            <SliderRowSkeleton />
          </>
        ) : config ? (
          SLIDERS.map((slider) => {
            const limit = getLimits[slider.limitKey];
            return (
              <SliderRow
                key={slider.key}
                label={slider.label}
                description={slider.description}
                value={config[slider.key] as number}
                min={limit.min}
                max={limit.max}
                step={0.01}
                unit={slider.unit}
                onChange={(value) => onChange(slider.key, value)}
              />
            );
          })
        ) : (
          <div className="text-center text-zinc-500 py-4">설정을 불러올 수 없습니다</div>
        )}
      </div>
    </Card>
  );
}
