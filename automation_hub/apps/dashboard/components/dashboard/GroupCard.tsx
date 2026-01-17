'use client';

import { useState } from 'react';
import type { Group, Channel } from '@/types';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from './StatusBadge';
import { CHANNEL_TYPE_LABELS, cronToKorean } from '@/lib/utils';
import { runGroup } from '@/lib/api';

interface GroupCardProps {
  group: Group;
  channels: Channel[];
  onRefresh?: () => void;
}

export default function GroupCard({ group, channels, onRefresh }: GroupCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = channels.filter((c) => c.last_run_status === 'success').length;
  const errorCount = channels.filter((c) => c.status === 'error').length;
  const progress = channels.length > 0 ? (completedCount / channels.length) * 100 : 0;

  const handleRunGroup = async () => {
    setIsRunning(true);
    const { error } = await runGroup(group.id);
    if (error) {
      console.error('그룹 실행 실패:', error);
    }
    setIsRunning(false);
    onRefresh?.();
  };

  const getTypeIcon = () => {
    switch (group.type) {
      case 'youtube_shorts':
        return '📺';
      case 'naver_blog':
        return '📝';
      case 'nextjs_blog':
        return '🌐';
      default:
        return '📁';
    }
  };

  return (
    <Card className="hover:bg-zinc-750 transition-colors">
      <CardContent>
        {/* 그룹 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon()}</span>
            <div>
              <h3 className="font-semibold text-zinc-100">{group.name}</h3>
              <p className="text-sm text-zinc-500">{channels.length}개 채널</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunGroup}
              isLoading={isRunning}
            >
              ▶
            </Button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-zinc-400">{completedCount}/{channels.length} 완료</span>
            {errorCount > 0 && (
              <span className="text-red-400">{errorCount} 오류</span>
            )}
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 스케줄 정보 */}
        <div className="text-sm text-zinc-500">
          스케줄: {cronToKorean(group.schedule_cron)}
        </div>

        {/* 확장된 채널 목록 */}
        {isExpanded && channels.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700 space-y-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between py-2 px-3 bg-zinc-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={channel.status} showDot />
                  <span className="text-sm text-zinc-200">{channel.name}</span>
                </div>
                {channel.last_run_status && (
                  <StatusBadge status={channel.last_run_status} size="sm" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
