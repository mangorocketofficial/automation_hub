'use client';

import Card from '@/components/ui/Card';
import type { GovernanceConfig } from '@/types/analysis';

interface DailyLimitsProps {
  config: GovernanceConfig | null;
  isLoading: boolean;
  onChange: (key: keyof GovernanceConfig, value: number) => void;
}

interface LimitInputProps {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

function LimitInput({
  label,
  value,
  unit,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  disabled,
}: LimitInputProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <label className="text-sm text-zinc-300 w-32">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-24 px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 text-sm
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="text-sm text-zinc-500">{unit}</span>
    </div>
  );
}

function LimitInputSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="h-4 w-32 bg-zinc-600 rounded" />
      <div className="h-8 w-24 bg-zinc-600 rounded" />
      <div className="h-4 w-8 bg-zinc-600 rounded" />
    </div>
  );
}

export default function DailyLimits({ config, isLoading, onChange }: DailyLimitsProps) {
  const LIMITS: {
    key: keyof GovernanceConfig;
    label: string;
    unit: string;
    min?: number;
    max?: number;
    step?: number;
  }[] = [
    { key: 'max_candidates_per_day', label: '일일 최대 생성', unit: '개', min: 1, max: 200 },
    { key: 'max_uploads_per_day', label: '일일 최대 업로드', unit: '개', min: 1, max: 50 },
    { key: 'daily_cost_cap_usd', label: '일일 비용 한도', unit: 'USD', min: 1, max: 500, step: 0.5 },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🚦</span>
        <h3 className="text-lg font-semibold text-zinc-100">일일 한도</h3>
      </div>

      <div>
        {isLoading ? (
          <>
            <LimitInputSkeleton />
            <LimitInputSkeleton />
            <LimitInputSkeleton />
          </>
        ) : config ? (
          LIMITS.map((limit) => (
            <LimitInput
              key={limit.key}
              label={limit.label}
              value={config[limit.key] as number}
              unit={limit.unit}
              min={limit.min}
              max={limit.max}
              step={limit.step}
              onChange={(value) => onChange(limit.key, value)}
            />
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">설정을 불러올 수 없습니다</div>
        )}
      </div>
    </Card>
  );
}
