'use client';

import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { GovernanceConfig } from '@/types/analysis';

interface MasterSwitchesProps {
  config: GovernanceConfig | null;
  isLoading: boolean;
  onChange: (key: keyof GovernanceConfig, value: boolean) => void;
}

interface SwitchRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SwitchRow({ label, description, checked, onChange, disabled }: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 last:border-0">
      <div>
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        <div className="text-xs text-zinc-500">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          checked ? 'bg-emerald-600' : 'bg-zinc-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            checked ? 'left-7' : 'left-1'
          )}
        />
        <span className="sr-only">{checked ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
}

function SwitchRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 animate-pulse">
      <div>
        <div className="h-4 w-32 bg-zinc-600 rounded mb-1" />
        <div className="h-3 w-48 bg-zinc-600 rounded" />
      </div>
      <div className="w-12 h-6 bg-zinc-600 rounded-full" />
    </div>
  );
}

const SWITCHES: {
  key: keyof GovernanceConfig;
  label: string;
  description: string;
}[] = [
  {
    key: 'enable_autonomous_selector',
    label: '자율 선택기 (Autonomous Selector)',
    description: 'AI가 자동으로 구조/훅/제목을 선택합니다',
  },
  {
    key: 'enable_performance_learning',
    label: '성과 학습 (Performance Learning)',
    description: '업로드 성과에 따라 점수를 자동 업데이트합니다',
  },
  {
    key: 'enable_failure_feedback',
    label: '실패 피드백 (Failure Feedback)',
    description: '실패 이벤트를 감지하고 패널티를 적용합니다',
  },
  {
    key: 'enable_auto_upload',
    label: '자동 업로드 (Auto Upload)',
    description: '승인된 콘텐츠를 자동으로 YouTube에 업로드합니다',
  },
];

export default function MasterSwitches({ config, isLoading, onChange }: MasterSwitchesProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔘</span>
        <h3 className="text-lg font-semibold text-zinc-100">마스터 스위치</h3>
      </div>

      <div>
        {isLoading ? (
          <>
            <SwitchRowSkeleton />
            <SwitchRowSkeleton />
            <SwitchRowSkeleton />
            <SwitchRowSkeleton />
          </>
        ) : config ? (
          SWITCHES.map((sw) => (
            <SwitchRow
              key={sw.key}
              label={sw.label}
              description={sw.description}
              checked={config[sw.key] as boolean}
              onChange={(value) => onChange(sw.key, value)}
            />
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">설정을 불러올 수 없습니다</div>
        )}
      </div>
    </Card>
  );
}
