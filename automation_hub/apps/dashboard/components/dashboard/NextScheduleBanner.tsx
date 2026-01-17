'use client';

interface Schedule {
  id: string;
  target_type: string;
  target_id: string;
  cron: string;
  is_active: boolean;
  next_run_at?: string;
  target_name?: string;
}

interface NextScheduleBannerProps {
  schedules: Schedule[];
}

export default function NextScheduleBanner({ schedules }: NextScheduleBannerProps) {
  const activeSchedules = schedules.filter((s) => s.is_active && s.next_run_at);

  if (activeSchedules.length === 0) {
    return null;
  }

  // 가장 가까운 스케줄 찾기
  const sortedSchedules = [...activeSchedules].sort((a, b) => {
    if (!a.next_run_at || !b.next_run_at) return 0;
    return new Date(a.next_run_at).getTime() - new Date(b.next_run_at).getTime();
  });

  const nextSchedule = sortedSchedules[0];
  if (!nextSchedule?.next_run_at) return null;

  const nextTime = new Date(nextSchedule.next_run_at);
  const now = new Date();
  const diffMs = nextTime.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const timeString = nextTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  let timeUntil = '';
  if (diffHours > 0) {
    timeUntil = `${diffHours}시간 ${diffMinutes}분 후`;
  } else if (diffMinutes > 0) {
    timeUntil = `${diffMinutes}분 후`;
  } else {
    timeUntil = '곧 실행';
  }

  return (
    <div className="bg-gradient-to-r from-emerald-600/20 to-zinc-800 border border-emerald-600/30 rounded-xl px-6 py-4 flex items-center gap-4">
      <div className="flex items-center gap-2 text-emerald-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">다음 예정</span>
      </div>
      <div className="text-zinc-100">
        <span className="font-semibold">{timeString}</span>
        <span className="mx-2 text-zinc-500">|</span>
        <span>{nextSchedule.target_name || '알 수 없음'}</span>
        <span className="ml-2 text-zinc-500">({timeUntil})</span>
      </div>
    </div>
  );
}
