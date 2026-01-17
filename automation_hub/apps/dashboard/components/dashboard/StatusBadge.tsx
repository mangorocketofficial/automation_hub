import { cn } from '@/lib/utils';

type Status = 'active' | 'paused' | 'error' | 'running' | 'success' | 'failed';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const statusStyles: Record<Status, string> = {
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-zinc-500/20 text-zinc-400',
  error: 'bg-red-500/20 text-red-400',
  running: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
};

const dotColors: Record<Status, string> = {
  active: 'bg-green-500',
  paused: 'bg-zinc-500',
  error: 'bg-red-500',
  running: 'bg-yellow-500',
  success: 'bg-green-500',
  failed: 'bg-red-500',
};

const statusLabels: Record<Status, string> = {
  active: '활성',
  paused: '일시정지',
  error: '오류',
  running: '실행중',
  success: '성공',
  failed: '실패',
};

export default function StatusBadge({ status, size = 'md', showDot = false }: StatusBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  if (showDot) {
    return (
      <span className={cn('w-2 h-2 rounded-full', dotColors[status])} />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        statusStyles[status],
        sizeStyles[size]
      )}
    >
      {status === 'running' && (
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
      )}
      {statusLabels[status]}
    </span>
  );
}
