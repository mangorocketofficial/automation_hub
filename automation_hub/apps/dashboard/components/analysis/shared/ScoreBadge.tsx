'use client';

import { cn } from '@/lib/utils';
import type { EntityStatus } from '@/types/analysis';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = 'md', showIcon = true, className }: ScoreBadgeProps) {
  const getColorClass = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getIcon = (s: number) => {
    if (s >= 80) return '🟢';
    if (s >= 60) return '🟡';
    return '🔴';
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
  };

  return (
    <span className={cn(sizeClasses[size], getColorClass(score), className)}>
      {showIcon && <span className="mr-1">{getIcon(score)}</span>}
      {score.toFixed(1)}
    </span>
  );
}

interface StatusBadgeProps {
  status: EntityStatus;
  isFrozen?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, isFrozen = false, size = 'md', className }: StatusBadgeProps) {
  const statusConfig: Record<EntityStatus, { bg: string; text: string; label: string }> = {
    STABLE: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'STABLE' },
    CANDIDATE: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'CANDID' },
    EXPERIMENT: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'EXPER' },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'rounded font-medium inline-flex items-center gap-1',
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
      {isFrozen && <span className="text-blue-400">❄️</span>}
    </span>
  );
}

interface PenaltyBadgeProps {
  penalty: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function PenaltyBadge({ penalty, size = 'md', className }: PenaltyBadgeProps) {
  const getColorClass = (p: number) => {
    if (p >= 0.15) return 'text-red-400 bg-red-500/20';
    if (p >= 0.08) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-zinc-400 bg-zinc-500/20';
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <span className={cn('rounded font-medium', getColorClass(penalty), sizeClasses[size], className)}>
      -{(penalty * 100).toFixed(1)}%
    </span>
  );
}
