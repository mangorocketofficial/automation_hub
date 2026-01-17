'use client';

import type { RunLog } from '@/types';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface RecentLogsProps {
  logs: RunLog[];
  channelNames: Record<string, string>;
}

export default function RecentLogs({ logs, channelNames }: RecentLogsProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-zinc-500 py-4">최근 실행 로그가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 로그</CardTitle>
        <Link href="/stats" className="text-sm text-emerald-400 hover:text-emerald-300">
          전체보기
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {logs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 px-3 bg-zinc-700/30 rounded-lg hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-16">
                  {formatRelativeTime(log.started_at)}
                </span>
                <span className="text-sm text-zinc-200">
                  {channelNames[log.channel_id] || log.channel_id.slice(0, 8)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={log.status} size="sm" />
                {log.error_message && (
                  <span className="text-xs text-red-400 max-w-32 truncate" title={log.error_message}>
                    {log.error_message}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
